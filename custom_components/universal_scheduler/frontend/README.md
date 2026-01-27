# Universal Scheduler Frontend

This directory contains the frontend code for the Universal Scheduler custom component.

## Architecture

The frontend consists of modular JavaScript files that are bundled together:

### Source Files
| File | Description |
|------|-------------|
| `styles.js` | CSS styles for all panel and card components |
| `templates.js` | HTML templates for the panel and scheduler cards |
| `utils.js` | Utility functions (entity info, time formatting, icons, interpolation) |
| `attribute-config.js` | Domain-specific attribute configurations |
| `graph.js` | GraphHandler class for graph rendering and interaction |
| `services.js` | Home Assistant service calls and data loading |
| `panel-modular.js` | Main panel class for the sidebar panel |
| `lovelace-card.js` | Lovelace card for dashboard integration |

### Bundle Files
| File | Description |
|------|-------------|
| `panel.js` | Bundled panel (auto-generated, ~260 KB) |
| `card.js` | Bundled Lovelace card (auto-generated, ~110 KB) |

## Building

Run the Python build script to regenerate the bundled files:

```bash
cd /workspaces/core/config/custom_components/universal_scheduler/frontend
python build.py
```

This will:
1. Concatenate all modules into `panel.js`
2. Bundle the Lovelace card into `card.js`
3. Strip ES module syntax and wrap in IIFEs

---

## Lovelace Card

The Universal Scheduler provides a Lovelace card for displaying and editing schedulers directly on your dashboard.

### Adding the Card

The card is automatically registered when the integration loads. Add it through:
1. **GUI**: Click "Add Card" → Search for "Universal Scheduler Card"
2. **YAML**: Use `type: custom:universal-scheduler-card`

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | required | The scheduler entity ID (e.g., `switch.universal_scheduler_light_bedroom`) |
| `graph_index` | number | - | Specific graph index to display (0, 1, 2...). Omit to show graph selector |
| `graph_height` | number | 200 | Height of the graph in pixels (100-600) |
| `show_header` | boolean | true | Show card header with entity name and status |
| `allow_edit` | boolean | true | Allow editing points by dragging and double-clicking |
| `show_graph_settings` | boolean | false | Show graph settings section (only visible when `allow_edit` is true) |
| `show_points_editor` | boolean | false | Show collapsible points editor (only visible when `allow_edit` is true) |
| `show_weekdays` | boolean | true | Show the weekday selector buttons |
| `show_current_value` | boolean | true | Show current and next value display with Apply button |
| `allow_toggle` | boolean | false | Show a toggle switch in header to enable/disable the scheduler |

> **Note:** The `show_graph_settings` and `show_points_editor` options are only effective when `allow_edit` is enabled. If `allow_edit` is false, these sections are always hidden regardless of their settings.

### Example YAML Configuration

```yaml
type: custom:universal-scheduler-card
entity: switch.universal_scheduler_light_bedroom
graph_height: 250
show_header: true
allow_edit: true
show_graph_settings: false
show_points_editor: false
show_weekdays: true
show_current_value: true
allow_toggle: true
```

### Minimal Configuration

```yaml
type: custom:universal-scheduler-card
entity: switch.universal_scheduler_climate_living_room
```

### View-Only Configuration

```yaml
type: custom:universal-scheduler-card
entity: switch.universal_scheduler_light_bedroom
allow_edit: false
show_header: true
allow_toggle: true
```

### Show Specific Graph

```yaml
type: custom:universal-scheduler-card
entity: switch.universal_scheduler_light_bedroom
graph_index: 0
show_header: false
graph_height: 150
```

### GUI Configuration

The card supports full GUI configuration through the Lovelace visual editor:
1. Add a new card and search for "Universal Scheduler Card"
2. Select the scheduler entity from the dropdown
3. Configure display options using checkboxes

### Edit Mode Behavior

When Lovelace is in edit mode (editing the dashboard):
- Graph settings are automatically expanded for configuration
- This behavior is independent of the `show_graph_settings` option

When viewing the dashboard normally:
- Graph settings visibility is controlled by `show_graph_settings`
- If `true`, settings are shown collapsed and can be expanded
- If `false`, settings are hidden entirely

### Card Features

**Header Controls:**
- Shows entity name and scheduler status (active/paused)
- Optional toggle switch to enable/disable the scheduler (`allow_toggle: true`)
- When toggle is enabled, click the switch to turn scheduler on/off

**Staged Changes & Undo/Redo:**
- Changes to points are staged locally before saving
- **Undo button** (↶): Reverts the last change
- **Redo button** (↷): Re-applies an undone change
- **Save button** (✓): Commits all staged changes to Home Assistant
- **Reset button** (✗): Discards all staged changes and restores original state
- Yellow warning bar appears when you have unsaved changes
- Changes are automatically reset if you navigate away

**Graph Interaction:**
- Drag points to adjust values
- Double-click on the graph to add new points
- Points snap to configured X/Y snap intervals
- Current time marker shows real-time position (time-based graphs)
- Click a point once to select, click again to delete

**Graph Settings:**
- **Y-Min/Y-Max**: Set the value range for the Y axis
- **Y-Snap**: Snap interval for values (e.g., 5 snaps to 0, 5, 10...)
- **X-Snap**: Snap interval for X axis (time or position)
- **X-Axis Type**: Choose between Time-based or Index-based graph

**Weekday Selector:**
- Toggle which days the schedule applies to
- Click days to enable/disable

**Points Editor:**
- Collapsible section for precise point editing
- Add/remove points manually
- Edit exact time/value for each point

**Current Value Display:**
- Shows current interpolated value
- Shows next scheduled change
- "Apply" button to immediately apply current value

---

## Module Descriptions

### styles.js
Contains the `PANEL_STYLES` constant with all CSS for:
- Panel layout and header
- Scheduler cards with collapsible sections
- Graph container, grid, and axes
- Points, curves, and tooltips
- Modals, forms, and buttons
- Autocomplete dropdowns

### templates.js
Contains:
- `PANEL_TEMPLATE` - Main panel HTML structure
- `createSchedulerCardHTML()` - Function to generate card HTML
- `createGraphHTML()` - Function to generate graph section HTML

### utils.js
Contains utility functions:
- `getEntityInfo()` - Auto-detect entity min/max/unit
- `getControllableEntities()` - List controllable domains
- `minutesToTime()` / `timeToMinutes()` - Time conversion
- `getDomainIcon()` - Get MDI icon for domain
- `interpolateValue()` - Calculate value on curve
- `interpolateValueWithStepToMin()` - Step-to-min interpolation
- `generateInterpolatedPath()` - Generate curve points
- `parsePoints()` - Parse points from various formats
- `clamp()` - Clamp value between bounds

### graph.js
Contains the `GraphHandler` class with methods for:
- `renderGraph()` - Draw SVG curve and points
- `renderYAxis()`, `renderXAxis()`, `renderGrid()` - Axis rendering
- `handleGraphMouseDown/Move/Leave()` - Mouse interactions
- `handleGraphWheel()` - Zoom control
- `setupTouchHandlers()` - Touch support
- `showPointTooltip()`, `hidePointTooltip()` - Point tooltips
- `updateCurrentTimeMarker()`, `updateCurrentValue()` - Time display

### services.js
Contains service functions:
- `applySchedulerNow()` - Apply current value to entity
- `saveScheduler()` - Save scheduler config
- `deleteScheduler()` - Delete scheduler
- `loadSchedulersFromHA()` - Load via WebSocket
- `parseSchedulerConfig()` - Parse config to internal format

### panel-modular.js
Main `UniversalSchedulerPanel` class:
- Constructor with state initialization
- `init()` - Set up DOM and event listeners
- `setupEventListeners()` - Global event handlers
- `renderSchedulers()` - Render scheduler cards
- `createSchedulerCard()` - Create card elements
- Pagination, filtering, and settings modal

### lovelace-card.js
Contains two classes:
- `UniversalSchedulerCardEditor` - GUI config editor
- `UniversalSchedulerCard` - Main card component

---

## Development

When making changes:
1. Edit the source module files (not the bundled files)
2. Run `python build.py` to regenerate bundles
3. Clear browser cache and reload Home Assistant

## Dependencies

The frontend requires:
- Home Assistant's `ha-icon` and `ha-card` components
- CSS custom properties from HA theme
- WebSocket API for data loading/saving
