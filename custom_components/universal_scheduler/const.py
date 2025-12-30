"""Constants for the Universal Scheduler integration."""

DOMAIN = "universal_scheduler"
ATTR_TARGET_ENTITY = "target_entity"
ATTR_DOMAIN = "domain"
ATTR_MODE = "mode"
ATTR_MIN_Y = "min_y"
ATTR_MAX_Y = "max_y"
ATTR_POINTS = "points"
ATTR_SNAP_MINUTES = "snap_minutes"
ATTR_UPDATE_INTERVAL = "update_interval"
ATTR_ENABLED = "enabled"

SERVICE_SET_CONFIG = "set_schedule_config"
SERVICE_CREATE_SCHEDULER = "create_scheduler"
SERVICE_DELETE_SCHEDULER = "delete_scheduler"
SERVICE_APPLY_NOW = "apply_now"
SERVICE_GET_SCHEDULERS = "get_schedulers"

PLATFORMS = ["switch"]

# Interpolation modes
MODE_LINEAR = "linear"
MODE_SMOOTH = "smooth"
MODE_STEP = "step"

# Default config
DEFAULT_DOMAIN = "light"
DEFAULT_MODE = MODE_LINEAR
DEFAULT_MIN_Y = 0
DEFAULT_MAX_Y = 100
DEFAULT_SNAP_MINUTES = 30
DEFAULT_UPDATE_INTERVAL = 300  # seconds (5 minutes)
