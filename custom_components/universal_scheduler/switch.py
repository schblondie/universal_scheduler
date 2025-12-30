"""Complete switch implementation for Universal Scheduler."""

import logging
import json
import math
from typing import Any
from datetime import datetime
from datetime import timedelta

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util
from homeassistant.config_entries import ConfigEntry
from homeassistant.exceptions import HomeAssistantError
from datetime import timedelta

from .const import (
    DOMAIN,
    ATTR_TARGET_ENTITY,
    ATTR_DOMAIN,
    ATTR_MODE,
    ATTR_MIN_Y,
    ATTR_MAX_Y,
    ATTR_POINTS,
    ATTR_UPDATE_INTERVAL,
    DEFAULT_DOMAIN,
    DEFAULT_MODE,
    DEFAULT_MIN_Y,
    DEFAULT_MAX_Y,
    DEFAULT_UPDATE_INTERVAL,
    MODE_LINEAR,
    MODE_SMOOTH,
    MODE_STEP,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up scheduler switches from config entry."""

    # Check if we have any schedulers to create
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}

    if "schedulers" not in hass.data[DOMAIN]:
        hass.data[DOMAIN]["schedulers"] = {}

    # Store callback and entity registry for dynamic entity management
    hass.data[DOMAIN]["async_add_entities"] = async_add_entities
    hass.data[DOMAIN]["switch_entities"] = {}

    schedulers = hass.data[DOMAIN].get("schedulers", {})

    if schedulers:
        entities = []
        for entity_id, config in schedulers.items():
            entity = UniversalSchedulerSwitch(
                hass, config.get("name", entity_id), entity_id, config
            )
            entities.append(entity)
            hass.data[DOMAIN]["switch_entities"][entity_id] = entity
        async_add_entities(entities)


class UniversalSchedulerSwitch(SwitchEntity, RestoreEntity):
    """Represents a Universal Scheduler switch entity."""

    def __init__(
        self, hass: HomeAssistant, name: str, entity_id: str, config: dict
    ) -> None:
        """Initialize the scheduler switch."""
        self.hass = hass
        self._name = name
        self._entity_id = entity_id
        # Respect the stored "enabled" flag so schedulers can start updating automatically
        self._is_on = bool(config.get("enabled", True))
        self._remove_listener = None

        # Top-level config
        self._target_entity = config.get(ATTR_TARGET_ENTITY, entity_id)
        self._domain = config.get(ATTR_DOMAIN, DEFAULT_DOMAIN)
        self._update_interval = int(
            config.get(ATTR_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL)
        )

        # Multi-graph support - store entire graphs array
        self._graphs = config.get("graphs", [])

        # Legacy fallback - if no graphs array, create one from flat config
        if not self._graphs:
            self._graphs = [
                {
                    "id": "graph_1",
                    "label": config.get("graph_label", "Schedule 1"),
                    "weekdays": config.get("weekdays", [0, 1, 2, 3, 4, 5, 6]),
                    "attribute": config.get("attribute"),
                    "mode": config.get(ATTR_MODE, DEFAULT_MODE),
                    "min_y": float(config.get(ATTR_MIN_Y, DEFAULT_MIN_Y)),
                    "max_y": float(config.get(ATTR_MAX_Y, DEFAULT_MAX_Y)),
                    "y_snap": config.get("y_snap", 0),
                    "step_to_zero": config.get("step_to_zero", False),
                    "x_axis_type": "time",
                    "x_axis_entity": None,
                    "points": config.get(
                        ATTR_POINTS, [{"x": 0, "y": 0}, {"x": 1440, "y": 0}]
                    ),
                }
            ]

        # For backward compatibility, expose first graph's settings as primary
        self._attribute = self._graphs[0].get("attribute") if self._graphs else None
        self._mode = (
            self._graphs[0].get("mode", DEFAULT_MODE) if self._graphs else DEFAULT_MODE
        )
        self._min_y = (
            float(self._graphs[0].get("min_y", DEFAULT_MIN_Y))
            if self._graphs
            else DEFAULT_MIN_Y
        )
        self._max_y = (
            float(self._graphs[0].get("max_y", DEFAULT_MAX_Y))
            if self._graphs
            else DEFAULT_MAX_Y
        )
        self._points = (
            self._graphs[0].get("points", [{"x": 0, "y": 0}, {"x": 1440, "y": 0}])
            if self._graphs
            else []
        )

    @property
    def name(self) -> str:
        """Return the name of the switch."""
        return self._name

    @property
    def unique_id(self) -> str:
        """Return a unique ID."""
        return f"scheduler_{self._entity_id.replace('.', '_')}"

    @property
    def entity_id(self) -> str:
        """Return the entity ID."""
        return f"switch.scheduler_{self._entity_id.replace('.', '_')}"

    @entity_id.setter
    def entity_id(self, value: str) -> None:
        """Set the entity ID."""
        pass  # Prevent Home Assistant from changing it

    @property
    def is_on(self) -> bool:
        """Return True if switch is on."""
        return self._is_on

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        return {
            ATTR_TARGET_ENTITY: self._target_entity,
            "attribute": self._attribute,
            ATTR_DOMAIN: self._domain,
            ATTR_MODE: self._mode,
            ATTR_MIN_Y: self._min_y,
            ATTR_MAX_Y: self._max_y,
            ATTR_UPDATE_INTERVAL: self._update_interval,
            ATTR_POINTS: json.dumps(self._points),
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn on the scheduler."""
        self._is_on = True
        self.async_write_ha_state()

        _LOGGER.debug(
            "Scheduler switch %s turned on; starting interval loop (every %ss)",
            self._target_entity,
            self._update_interval,
        )

        # Start the update loop with configured interval
        await self._start_update_listener()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn off the scheduler."""
        self._is_on = False
        self.async_write_ha_state()

        # Stop the update loop
        if self._remove_listener:
            self._remove_listener()
            self._remove_listener = None

        _LOGGER.debug(
            "Scheduler switch %s turned off; interval loop stopped", self._target_entity
        )

    async def async_added_to_hass(self) -> None:
        """Restore state on startup."""
        await super().async_added_to_hass()

        # Restore the previous state
        if (state := await self.async_get_last_state()) is not None:
            self._is_on = state.state == "on"

        # If enabled (from restored state or config), start the interval immediately
        if self._is_on:
            await self._start_update_listener()

    async def async_will_remove_from_hass(self) -> None:
        """Clean up on removal."""
        if self._remove_listener:
            self._remove_listener()
            self._remove_listener = None

    async def _start_update_listener(self) -> None:
        """Start or restart the periodic update listener and run an immediate update."""
        if not self._is_on:
            _LOGGER.debug(
                "Skip starting listener for %s because scheduler is off",
                self._target_entity,
            )
            return

        # Restart the listener if it already exists so interval changes take effect
        if self._remove_listener:
            self._remove_listener()

        self._remove_listener = async_track_time_interval(
            self.hass, self._update_entity, timedelta(seconds=self._update_interval)
        )

        # Trigger an immediate update so the target reflects the schedule right away
        await self._update_entity()

        _LOGGER.debug(
            "Listener started for %s; interval=%ss",
            self._target_entity,
            self._update_interval,
        )

    async def set_config(
        self,
        target_entity: str,
        domain: str,
        attribute: str | None,
        mode: str,
        min_y: float,
        max_y: float,
        points: list,
        update_interval: int | None = None,
        enabled: bool | None = None,
        graphs: list | None = None,
    ) -> None:
        """Update the scheduler configuration."""
        self._target_entity = target_entity
        self._domain = domain
        self._attribute = attribute
        self._mode = mode
        self._min_y = float(min_y)
        self._max_y = float(max_y)
        self._points = points

        # Update full graphs payload when provided (multi-graph support)
        if graphs is not None:
            self._graphs = graphs
            if self._graphs:
                primary = self._graphs[0]
                self._attribute = primary.get("attribute")
                self._mode = primary.get("mode", DEFAULT_MODE)
                self._min_y = float(primary.get("min_y", DEFAULT_MIN_Y))
                self._max_y = float(primary.get("max_y", DEFAULT_MAX_Y))
                self._points = primary.get(
                    "points", [{"x": 0, "y": 0}, {"x": 1440, "y": 0}]
                )

        if update_interval is not None and update_interval != self._update_interval:
            self._update_interval = int(update_interval)

        if enabled is not None:
            self._is_on = enabled

        if self._is_on:
            await self._start_update_listener()
        else:
            if self._remove_listener:
                self._remove_listener()
                self._remove_listener = None

        self.async_write_ha_state()

    def _get_active_graph_for_day(self, weekday: int) -> dict | None:
        """Get the graph that should be active for the given weekday.

        Returns the first graph whose weekdays list includes the given day.
        weekday: 0=Sunday, 1=Monday, ..., 6=Saturday (JavaScript convention)
        """
        for graph in self._graphs:
            weekdays = graph.get("weekdays", [0, 1, 2, 3, 4, 5, 6])
            if weekday in weekdays:
                return graph
        return None

    async def _update_entity(self, now: datetime | None = None) -> None:
        """Update the target entity based on the current schedule."""
        if not self._target_entity or not self._is_on:
            _LOGGER.debug(
                "Skip update: target=%s is_on=%s", self._target_entity, self._is_on
            )
            return

        try:
            # 1. Calculate current time in minutes and get weekday
            current_time = dt_util.now()
            # Use sub-minute resolution so short intervals apply on time
            current_minute = (
                current_time.hour * 60
                + current_time.minute
                + current_time.second / 60
                + current_time.microsecond / 60000000
            )
            # Python weekday: 0=Monday, 6=Sunday. Convert to JS: 0=Sunday, 1=Monday, etc.
            python_weekday = current_time.weekday()  # 0=Mon, 6=Sun
            js_weekday = (python_weekday + 1) % 7  # Convert: Mon=1, Sun=0

            _LOGGER.debug(
                "Updating scheduler for %s at %s (minute=%s, weekday=%s) interval=%ss",
                self._target_entity,
                current_time.isoformat(),
                current_minute,
                js_weekday,
                self._update_interval,
            )

            # 2. Find the active graph for today
            active_graph = self._get_active_graph_for_day(js_weekday)
            if not active_graph:
                _LOGGER.debug(
                    "No active graph for weekday %s, skipping update", js_weekday
                )
                return

            # Get graph-specific settings
            mode = active_graph.get("mode", DEFAULT_MODE)
            min_y = float(active_graph.get("min_y", DEFAULT_MIN_Y))
            max_y = float(active_graph.get("max_y", DEFAULT_MAX_Y))
            points = active_graph.get("points", [{"x": 0, "y": 0}, {"x": 1440, "y": 0}])
            attribute = active_graph.get("attribute")

            # 3. Get the Y value at this minute using the active graph
            val_ratio = self._calculate_y_ratio_from_points(
                current_minute, points, mode, min_y, max_y
            )

            # 4. Map ratio to actual value
            actual_value = min_y + (val_ratio * (max_y - min_y))

            _LOGGER.debug(
                "Scheduler %s domain=%s graph=%s value=%.3f (ratio=%.3f) min=%.2f max=%.2f",
                self._target_entity,
                self._domain,
                active_graph.get("label", "unknown"),
                actual_value,
                val_ratio,
                min_y,
                max_y,
            )

            # 5. Apply based on domain (with attribute support)
            if self._domain == "light":
                await self._apply_light(actual_value, attribute)
            elif self._domain == "climate":
                await self._apply_climate(actual_value)
            elif self._domain in ("number", "input_number"):
                await self._apply_number(actual_value)
            elif self._domain == "fan":
                await self._apply_fan(actual_value)
            elif self._domain == "cover":
                await self._apply_cover(actual_value)
            elif self._domain == "humidifier":
                await self._apply_humidifier(actual_value)
            elif self._domain == "media_player":
                await self._apply_media_player(actual_value)
            else:
                _LOGGER.warning("Unknown domain: %s", self._domain)
        except Exception as err:
            _LOGGER.error("Error updating scheduler: %s", err)

    async def _apply_light(self, value: float, attribute: str | None = None) -> None:
        """Apply value to a light entity."""
        if attribute == "brightness":
            # Direct brightness value (0-255)
            brightness = int(value)
        elif attribute == "color_temp" or attribute == "color_temp_kelvin":
            # Color temperature - value is already in the right units (mireds or kelvin)
            _LOGGER.debug(
                "Apply light %s %s=%.2f", self._target_entity, attribute, value
            )
            await self.hass.services.async_call(
                "light",
                "turn_on",
                {
                    "entity_id": self._target_entity,
                    attribute: int(value),
                    "transition": 5,
                },
            )
            return
        else:
            # Default: percentage-based brightness
            brightness = int((value / 100) * 255) if value > 0 else 0

        _LOGGER.debug(
            "Apply light %s brightness=%s (value=%.2f)",
            self._target_entity,
            brightness,
            value,
        )

        if brightness > 0:
            # Ensure the light turns on with the requested brightness
            await self.hass.services.async_call(
                "light",
                "turn_on",
                {
                    "entity_id": self._target_entity,
                    "brightness": brightness,
                    "transition": 5,
                },
            )
        else:
            await self.hass.services.async_call(
                "light",
                "turn_off",
                {"entity_id": self._target_entity, "transition": 5},
            )

    async def _apply_climate(self, value: float) -> None:
        """Apply value to a climate entity."""
        _LOGGER.debug("Apply climate %s temp=%.2f", self._target_entity, value)
        await self.hass.services.async_call(
            "climate",
            "set_temperature",
            {"entity_id": self._target_entity, "temperature": round(value, 1)},
        )

    async def _apply_number(self, value: float) -> None:
        """Apply value to a number entity."""
        domain = self._target_entity.split(".")[0]
        _LOGGER.debug("Apply %s %s value=%.2f", domain, self._target_entity, value)
        await self.hass.services.async_call(
            domain,
            "set_value",
            {"entity_id": self._target_entity, "value": round(value, 2)},
        )

    async def _apply_fan(self, value: float) -> None:
        """Apply value to a fan entity (percentage)."""
        percentage = int(value)

        _LOGGER.debug(
            "Apply fan %s pct=%s (value=%.2f)", self._target_entity, percentage, value
        )

        # If fan is off and we want non-zero, turn it on first
        if percentage > 0:
            await self.hass.services.async_call(
                "fan",
                "turn_on",
                {"entity_id": self._target_entity},
            )

        if percentage > 0:
            await self.hass.services.async_call(
                "fan",
                "set_percentage",
                {"entity_id": self._target_entity, "percentage": percentage},
            )
        else:
            await self.hass.services.async_call(
                "fan",
                "turn_off",
                {"entity_id": self._target_entity},
            )

    async def _apply_cover(self, value: float) -> None:
        """Apply value to a cover entity (position)."""
        position = int(value)
        _LOGGER.debug(
            "Apply cover %s pos=%s (value=%.2f)", self._target_entity, position, value
        )
        if position > 0:
            # Best-effort to ensure movement: open command before setting position
            await self.hass.services.async_call(
                "cover",
                "open_cover",
                {"entity_id": self._target_entity},
            )
        await self.hass.services.async_call(
            "cover",
            "set_cover_position",
            {"entity_id": self._target_entity, "position": position},
        )

    async def _apply_humidifier(self, value: float) -> None:
        """Apply value to a humidifier entity (humidity)."""
        humidity = int(value)
        _LOGGER.debug(
            "Apply humidifier %s humidity=%s (value=%.2f)",
            self._target_entity,
            humidity,
            value,
        )
        if humidity > 0:
            await self.hass.services.async_call(
                "humidifier",
                "turn_on",
                {"entity_id": self._target_entity},
            )
        await self.hass.services.async_call(
            "humidifier",
            "set_humidity",
            {"entity_id": self._target_entity, "humidity": humidity},
        )

    async def _apply_media_player(self, value: float) -> None:
        """Apply value to a media player entity (volume)."""
        # Volume is 0.0 to 1.0 for media_player
        volume = value / 100.0
        _LOGGER.debug(
            "Apply media_player %s volume=%.3f (value=%.2f)",
            self._target_entity,
            volume,
            value,
        )
        if volume > 0:
            await self.hass.services.async_call(
                "media_player",
                "turn_on",
                {"entity_id": self._target_entity},
            )
        await self.hass.services.async_call(
            "media_player",
            "volume_set",
            {"entity_id": self._target_entity, "volume_level": round(volume, 2)},
        )

    def _calculate_y_ratio_from_points(
        self, current_minute: float, points: list, mode: str, min_y: float, max_y: float
    ) -> float:
        """Calculate the Y value (0.0 to 1.0) at the given minute for specific graph points."""
        if not points or len(points) < 2:
            return 0.0

        # Sort points by x coordinate
        sorted_points = sorted(points, key=lambda p: p["x"])

        # Handle wrap-around (points across midnight)
        if current_minute < sorted_points[0]["x"]:
            # We're before the first point, use the last point's value
            return (
                (sorted_points[-1]["y"] - min_y) / (max_y - min_y)
                if max_y != min_y
                else 0.0
            )

        # Find the two points we're between
        for i in range(len(sorted_points) - 1):
            p1 = sorted_points[i]
            p2 = sorted_points[i + 1]

            if p1["x"] <= current_minute <= p2["x"]:
                # We're between these two points
                return self._interpolate_points(
                    p1, p2, current_minute, mode, min_y, max_y
                )

        # We're after the last point
        return (
            (sorted_points[-1]["y"] - min_y) / (max_y - min_y)
            if max_y != min_y
            else 0.0
        )

    def _interpolate_points(
        self,
        p1: dict,
        p2: dict,
        current_minute: float,
        mode: str,
        min_y: float,
        max_y: float,
    ) -> float:
        """Interpolate between two points based on mode."""
        if p1["x"] == p2["x"]:
            return (p1["y"] - min_y) / (max_y - min_y) if max_y != min_y else 0.0

        ratio = (current_minute - p1["x"]) / (p2["x"] - p1["x"])
        y1 = (p1["y"] - min_y) / (max_y - min_y) if max_y != min_y else 0.0
        y2 = (p2["y"] - min_y) / (max_y - min_y) if max_y != min_y else 0.0

        if mode == MODE_STEP:
            # Step function - stay at p1's value until we reach p2
            return y1
        elif mode == MODE_SMOOTH:
            # Cosine interpolation for smooth curves
            return y1 + (y2 - y1) * (1 - math.cos(ratio * math.pi)) / 2
        else:
            # Linear interpolation (default)
            return y1 + (y2 - y1) * ratio

    def _calculate_y_ratio(self, current_minute: int) -> float:
        """Calculate the Y value (0.0 to 1.0) at the given minute of the day."""
        if not self._points or len(self._points) < 2:
            return 0.0

        # Sort points by x coordinate
        sorted_points = sorted(self._points, key=lambda p: p["x"])

        # Handle wrap-around (points across midnight)
        if current_minute < sorted_points[0]["x"]:
            # We're before the first point, use the last point's value
            return sorted_points[-1]["y"] / 100.0

        # Find the two points we're between
        for i in range(len(sorted_points) - 1):
            p1 = sorted_points[i]
            p2 = sorted_points[i + 1]

            if p1["x"] <= current_minute <= p2["x"]:
                # We're between these two points
                return self._interpolate(p1, p2, current_minute)

        # We're after the last point
        return sorted_points[-1]["y"] / 100.0

    def _interpolate(self, p1: dict, p2: dict, current_minute: int) -> float:
        """Interpolate between two points based on mode."""
        if p1["x"] == p2["x"]:
            return p1["y"] / 100.0

        ratio = (current_minute - p1["x"]) / (p2["x"] - p1["x"])
        y1 = p1["y"] / 100.0
        y2 = p2["y"] / 100.0

        if self._mode == MODE_STEP:
            # Step function - stay at p1's value until we reach p2
            return y1
        elif self._mode == MODE_SMOOTH:
            # Cosine interpolation for smooth curves
            return y1 + (y2 - y1) * (1 - math.cos(ratio * math.pi)) / 2
        else:
            # Linear interpolation (default)
            return y1 + (y2 - y1) * ratio
