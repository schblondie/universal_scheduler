import logging
import os
import json
import voluptuous as vol
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.http import StaticPathConfig
from homeassistant.helpers import config_validation as cv
from homeassistant.components.frontend import async_remove_panel
from homeassistant.components.panel_custom import async_register_panel
from homeassistant.helpers.storage import Store
from homeassistant.components import websocket_api

# Import from const
try:
    from .const import (
        DOMAIN,
        SERVICE_CREATE_SCHEDULER,
        SERVICE_SET_CONFIG,
        SERVICE_DELETE_SCHEDULER,
        SERVICE_APPLY_NOW,
        SERVICE_GET_SCHEDULERS,
    )
except ImportError:
    DOMAIN = "universal_scheduler"
    SERVICE_CREATE_SCHEDULER = "create_scheduler"
    SERVICE_SET_CONFIG = "set_schedule_config"
    SERVICE_DELETE_SCHEDULER = "delete_scheduler"
    SERVICE_APPLY_NOW = "apply_now"
    SERVICE_GET_SCHEDULERS = "get_schedulers"

_LOGGER = logging.getLogger(__name__)

URL_BASE = "/universal_scheduler_assets"
STORAGE_KEY = f"{DOMAIN}.schedulers"
STORAGE_VERSION = 2  # Bumped for multi-graph support
STORAGE_MINOR_VERSION = 1


class SchedulerStore(Store):
    """Store for scheduler data with migration support."""

    async def _async_migrate_func(
        self, old_major_version: int, old_minor_version: int, old_data: dict
    ) -> dict:
        """Migrate to the new version."""
        if old_major_version == 1:
            # Migrate from version 1 to version 2 (multi-graph format)
            _LOGGER.info("Migrating scheduler storage from version 1 to 2")
            schedulers = old_data.get("schedulers", {})

            for entity_id, cfg in schedulers.items():
                if "graphs" not in cfg:
                    # Extract graph-specific fields to create first graph
                    graph = {
                        "id": "graph_1",
                        "label": cfg.pop("graph_label", "Schedule 1"),
                        "weekdays": cfg.pop("weekdays", [0, 1, 2, 3, 4, 5, 6]),
                        "attribute": cfg.pop("attribute", None),
                        "mode": cfg.pop("mode", "linear"),
                        "min_y": cfg.pop("min_y", 0),
                        "max_y": cfg.pop("max_y", 100),
                        "x_snap": cfg.pop("snap_minutes", 0)
                        or 0,  # Convert snap_minutes to x_snap
                        "y_snap": cfg.pop("y_snap", 0),
                        "step_to_zero": cfg.pop("step_to_zero", False),
                        "x_axis_type": "time",
                        "x_axis_entity": None,
                        "x_axis_min": None,
                        "x_axis_max": None,
                        "x_axis_unit": None,
                        "points": cfg.pop(
                            "points", [{"x": 0, "y": 0}, {"x": 1440, "y": 0}]
                        ),
                    }
                    cfg["graphs"] = [graph]
                    cfg.setdefault("graphs_per_row", 1)

            old_data["multi_graph_migrated"] = True
            return old_data

        # For same major version, just return data
        return old_data


# Graph schema for individual graphs within a scheduler
GRAPH_SCHEMA = vol.Schema(
    {
        vol.Required("id"): cv.string,
        vol.Optional("label"): cv.string,
        vol.Optional("weekdays"): list,  # [0-6], 0=Sunday
        vol.Optional("attribute"): vol.Any(None, cv.string),
        vol.Optional("mode"): cv.string,
        vol.Optional("min_y"): vol.Coerce(float),
        vol.Optional("max_y"): vol.Coerce(float),
        vol.Optional("x_snap"): vol.Coerce(float),
        vol.Optional("y_snap"): vol.Coerce(float),
        vol.Optional("step_to_zero"): cv.boolean,
        vol.Optional("x_axis_type"): cv.string,  # 'time' or 'entity'
        vol.Optional("x_axis_entity"): vol.Any(
            None, cv.string
        ),  # entity for x-axis value
        vol.Optional("x_axis_min"): vol.Any(
            None, vol.Coerce(float)
        ),  # min value for entity-based x-axis
        vol.Optional("x_axis_max"): vol.Any(
            None, vol.Coerce(float)
        ),  # max value for entity-based x-axis
        vol.Optional("x_axis_unit"): vol.Any(
            None, cv.string
        ),  # unit for entity-based x-axis display
        vol.Optional("points"): list,
    }
)

# Service schemas
CREATE_SCHEDULER_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Required("entity_id"): cv.string,
    }
)

SET_CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): cv.string,
        vol.Optional("target_entity"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("domain"): cv.string,
        vol.Optional("update_interval"): vol.Coerce(int),
        vol.Optional("enabled"): cv.boolean,
        vol.Optional("graphs_per_row"): vol.Coerce(int),
        vol.Optional("graphs"): list,  # Array of graph configs
        # Legacy fields (for backward compatibility during migration)
        vol.Optional("attribute"): vol.Any(None, cv.string),
        vol.Optional("x_snap"): vol.Coerce(float),
        vol.Optional("y_snap"): vol.Coerce(float),
        vol.Optional("step_to_zero"): cv.boolean,
        vol.Optional("mode"): cv.string,
        vol.Optional("min_y"): vol.Coerce(float),
        vol.Optional("max_y"): vol.Coerce(float),
        vol.Optional("snap_minutes"): vol.Any(None, vol.Coerce(int)),
        vol.Optional("points"): list,
        vol.Optional("weekdays"): list,
        vol.Optional("graph_label"): cv.string,
    }
)

DELETE_SCHEDULER_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): cv.string,
    }
)

APPLY_NOW_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): cv.string,
    }
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up Universal Scheduler from config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN].setdefault("schedulers", {})

    # Setup persistent storage with migration support
    store = SchedulerStore(
        hass, STORAGE_VERSION, STORAGE_KEY, minor_version=STORAGE_MINOR_VERSION
    )
    hass.data[DOMAIN]["store"] = store

    def migrate_to_multi_graph(cfg):
        """Migrate legacy single-graph config to multi-graph format."""
        if "graphs" in cfg:
            return cfg  # Already migrated

        # Extract graph-specific fields to create first graph
        graph = {
            "id": "graph_1",
            "label": cfg.pop("graph_label", "Schedule 1"),
            "weekdays": cfg.pop("weekdays", [0, 1, 2, 3, 4, 5, 6]),
            "attribute": cfg.pop("attribute", None),
            "mode": cfg.pop("mode", "linear"),
            "min_y": cfg.pop("min_y", 0),
            "max_y": cfg.pop("max_y", 100),
            "x_snap": cfg.pop("snap_minutes", 0) or 0,  # Convert snap_minutes to x_snap
            "y_snap": cfg.pop("y_snap", 0),
            "step_to_zero": cfg.pop("step_to_zero", False),
            "x_axis_type": "time",  # Default to time-based
            "x_axis_entity": None,
            "points": cfg.pop("points", [{"x": 0, "y": 0}, {"x": 1440, "y": 0}]),
        }

        cfg["graphs"] = [graph]
        cfg.setdefault("graphs_per_row", 1)
        return cfg

    # Load saved schedulers from storage (migration handled by SchedulerStore)
    stored_data = await store.async_load()
    if stored_data:
        schedulers = stored_data.get("schedulers", {})
        interval_in_seconds = stored_data.get("interval_in_seconds", False)
        multi_graph_migrated = stored_data.get("multi_graph_migrated", False)

        if not interval_in_seconds:
            # Migrate legacy minute-based update_interval to seconds (values <= 60 assumed minutes)
            for cfg in schedulers.values():
                if (interval := cfg.get("update_interval")) is not None:
                    if interval <= 60:
                        cfg["update_interval"] = interval * 60
            interval_in_seconds = True

        # Migrate to multi-graph format if needed
        if not multi_graph_migrated:
            for entity_id, cfg in schedulers.items():
                schedulers[entity_id] = migrate_to_multi_graph(cfg)
            multi_graph_migrated = True
            _LOGGER.info("Migrated schedulers to multi-graph format")

        hass.data[DOMAIN]["interval_in_seconds"] = interval_in_seconds
        hass.data[DOMAIN]["multi_graph_migrated"] = multi_graph_migrated
        hass.data[DOMAIN]["schedulers"] = schedulers
        _LOGGER.info(
            f"Loaded {len(hass.data[DOMAIN]['schedulers'])} schedulers from storage"
        )

    # Register WebSocket API for frontend to fetch schedulers
    @websocket_api.websocket_command(
        {vol.Required("type"): "universal_scheduler/get_schedulers"}
    )
    @websocket_api.async_response
    async def websocket_get_schedulers(hass, connection, msg):
        """Handle get_schedulers WebSocket command."""
        schedulers = hass.data[DOMAIN].get("schedulers", {})
        connection.send_result(msg["id"], {"schedulers": schedulers})

    websocket_api.async_register_command(hass, websocket_get_schedulers)

    # 1. Locate the JS file inside this component folder
    component_path = os.path.dirname(__file__)
    frontend_path = os.path.join(component_path, "frontend")

    # 2. Register a static path to serve the JS
    await hass.http.async_register_static_paths(
        [StaticPathConfig(URL_BASE, frontend_path, cache_headers=False)]
    )

    # 3. Register custom panel using panel_custom's async_register_panel
    await async_register_panel(
        hass,
        frontend_url_path="universal-curve-scheduler",
        webcomponent_name="universal-curve-scheduler",
        sidebar_title="Curve Scheduler",
        sidebar_icon="mdi:chart-bell-curve-cumulative",
        module_url=f"{URL_BASE}/panel.js",
        embed_iframe=False,
        trust_external=False,
        require_admin=False,
    )

    # Helper function to save schedulers to storage
    async def save_schedulers():
        """Save schedulers to persistent storage."""
        await store.async_save(
            {
                "schedulers": hass.data[DOMAIN]["schedulers"],
                "interval_in_seconds": hass.data[DOMAIN].get(
                    "interval_in_seconds", True
                ),
                "multi_graph_migrated": hass.data[DOMAIN].get(
                    "multi_graph_migrated", True
                ),
            }
        )

    # Helper to dynamically create or update switch entities
    async def _ensure_switch_entity(entity_id: str):
        """Create a new switch entity or update existing one for the scheduler."""
        from .switch import UniversalSchedulerSwitch

        config = hass.data[DOMAIN]["schedulers"].get(entity_id)
        if not config:
            return

        switch_entities = hass.data[DOMAIN].get("switch_entities", {})
        async_add_entities = hass.data[DOMAIN].get("async_add_entities")

        if entity_id in switch_entities:
            # Entity exists - update its config and restart interval if needed
            entity = switch_entities[entity_id]
            await entity.set_config(
                target_entity=config.get("target_entity", entity_id),
                domain=config.get("domain", "light"),
                attribute=config.get("attribute"),
                mode=config.get("mode", "linear"),
                min_y=config.get("min_y", 0),
                max_y=config.get("max_y", 100),
                points=config.get("points", [{"x": 0, "y": 0}, {"x": 1440, "y": 0}]),
                update_interval=config.get("update_interval", 300),
                enabled=config.get("enabled", True),
                graphs=config.get("graphs"),
            )

            _LOGGER.debug(f"Updated existing switch entity for {entity_id}")
        elif async_add_entities:
            # Create new entity
            new_entity = UniversalSchedulerSwitch(
                hass, config.get("name", entity_id), entity_id, config
            )
            switch_entities[entity_id] = new_entity
            async_add_entities([new_entity])
            _LOGGER.info(f"Created new switch entity for {entity_id}")

    # 5. Forward to switch platform
    await hass.config_entries.async_forward_entry_setups(entry, ["switch"])

    # 6. Register services
    async def handle_create_scheduler(call):
        """Handle create_scheduler service call."""
        name = call.data.get("name")
        entity_id = call.data.get("entity_id")  # This is the target entity

        if not name or not entity_id:
            _LOGGER.error("create_scheduler service requires 'name' and 'entity_id'")
            return

        # Store in hass.data for the switch platform to access (multi-graph format)
        hass.data[DOMAIN]["schedulers"][entity_id] = {
            "name": name,
            "target_entity": entity_id,
            "domain": entity_id.split(".")[0] if "." in entity_id else "light",
            "enabled": True,
            "update_interval": 300,
            "graphs_per_row": 1,
            "graphs": [
                {
                    "id": "graph_1",
                    "label": "Schedule 1",
                    "weekdays": [0, 1, 2, 3, 4, 5, 6],
                    "attribute": None,
                    "mode": "linear",
                    "min_y": 0,
                    "max_y": 100,
                    "y_snap": 0,
                    "step_to_zero": False,
                    "x_axis_type": "time",
                    "x_axis_entity": None,
                    "x_axis_min": None,
                    "x_axis_max": None,
                    "x_axis_unit": None,
                    "points": [{"x": 0, "y": 0}, {"x": 1440, "y": 0}],
                }
            ],
        }

        await save_schedulers()
        _LOGGER.info(f"Created new scheduler: {name} for {entity_id}")

    async def handle_set_config(call):
        """Handle set_schedule_config service call."""
        entity_id = call.data.get("entity_id")

        # Create scheduler if it doesn't exist
        if entity_id not in hass.data[DOMAIN]["schedulers"]:
            # Check if using new multi-graph format or legacy format
            if "graphs" in call.data:
                hass.data[DOMAIN]["schedulers"][entity_id] = {
                    "name": call.data.get("name", entity_id),
                    "target_entity": call.data.get("target_entity", entity_id),
                    "domain": call.data.get("domain", "light"),
                    "enabled": call.data.get("enabled", True),
                    "update_interval": call.data.get("update_interval", 300),
                    "graphs_per_row": call.data.get("graphs_per_row", 1),
                    "graphs": call.data.get("graphs"),
                }
            else:
                # Legacy format - create with single graph
                hass.data[DOMAIN]["schedulers"][entity_id] = {
                    "name": call.data.get("name", entity_id),
                    "target_entity": call.data.get("target_entity", entity_id),
                    "domain": call.data.get("domain", "light"),
                    "enabled": call.data.get("enabled", True),
                    "update_interval": call.data.get("update_interval", 300),
                    "graphs_per_row": call.data.get("graphs_per_row", 1),
                    "graphs": [
                        {
                            "id": "graph_1",
                            "label": call.data.get("graph_label", "Schedule 1"),
                            "weekdays": call.data.get(
                                "weekdays", [0, 1, 2, 3, 4, 5, 6]
                            ),
                            "attribute": call.data.get("attribute"),
                            "mode": call.data.get("mode", "linear"),
                            "min_y": call.data.get("min_y", 0),
                            "max_y": call.data.get("max_y", 100),
                            "x_snap": call.data.get("x_snap", 0),
                            "y_snap": call.data.get("y_snap", 0),
                            "step_to_zero": call.data.get("step_to_zero", False),
                            "x_axis_type": "time",
                            "x_axis_entity": None,
                            "x_axis_min": None,
                            "x_axis_max": None,
                            "x_axis_unit": None,
                            "points": call.data.get(
                                "points", [{"x": 0, "y": 0}, {"x": 1440, "y": 0}]
                            ),
                        }
                    ],
                }
        else:
            # Update existing scheduler config
            scheduler = hass.data[DOMAIN]["schedulers"][entity_id]

            # Update top-level scheduler fields
            if "name" in call.data:
                scheduler["name"] = call.data["name"]
            if "target_entity" in call.data:
                scheduler["target_entity"] = call.data["target_entity"]
            if "domain" in call.data:
                scheduler["domain"] = call.data["domain"]
            if "update_interval" in call.data:
                scheduler["update_interval"] = call.data["update_interval"]
            if "enabled" in call.data:
                scheduler["enabled"] = call.data["enabled"]
            if "graphs_per_row" in call.data:
                scheduler["graphs_per_row"] = call.data["graphs_per_row"]

            # Update graphs array if provided
            if "graphs" in call.data:
                scheduler["graphs"] = call.data["graphs"]

        await save_schedulers()

        # Dynamically create or update the switch entity
        await _ensure_switch_entity(entity_id)

        _LOGGER.info(f"Updated scheduler config for: {entity_id}")

    async def handle_delete_scheduler(call):
        """Handle delete_scheduler service call."""
        entity_id = call.data.get("entity_id")

        if entity_id in hass.data[DOMAIN]["schedulers"]:
            del hass.data[DOMAIN]["schedulers"][entity_id]
            await save_schedulers()
            _LOGGER.info(f"Deleted scheduler: {entity_id}")
        else:
            _LOGGER.warning(f"Scheduler not found for deletion: {entity_id}")

    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_SCHEDULER,
        handle_create_scheduler,
        schema=CREATE_SCHEDULER_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_CONFIG,
        handle_set_config,
        schema=SET_CONFIG_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DELETE_SCHEDULER,
        handle_delete_scheduler,
        schema=DELETE_SCHEDULER_SCHEMA,
    )

    async def handle_apply_now(call):
        """Handle apply_now service call - immediately apply the current scheduled value."""
        entity_id = call.data.get("entity_id")

        # Find switch entities for this scheduler
        switch_entity_id = f"switch.scheduler_{entity_id.replace('.', '_')}"

        # Get the entity from the entity registry
        entity_component = hass.data.get("entity_components", {}).get("switch")
        if entity_component:
            for entity in entity_component.entities:
                if entity.entity_id == switch_entity_id:
                    await entity._update_entity()
                    _LOGGER.info(f"Applied current schedule value for: {entity_id}")
                    return

        _LOGGER.warning(f"Could not find scheduler switch for: {entity_id}")

    hass.services.async_register(
        DOMAIN,
        SERVICE_APPLY_NOW,
        handle_apply_now,
        schema=APPLY_NOW_SCHEMA,
    )

    # Service to get all schedulers (for frontend)
    async def handle_get_schedulers(call):
        """Handle get_schedulers service call - return all scheduler configs."""
        return {"schedulers": hass.data[DOMAIN].get("schedulers", {})}

    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_SCHEDULERS,
        handle_get_schedulers,
        schema=vol.Schema({}),
        supports_response="only",
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload Universal Scheduler config entry."""
    async_remove_panel(hass, "universal-curve-scheduler")
    return await hass.config_entries.async_unload_platforms(entry, ["switch"])
