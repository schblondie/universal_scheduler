# Universal Scheduler Frontend

This directory contains the frontend code for the Universal Scheduler panel.

## File Structure

The code is organized into modular source files that get bundled into a single `panel.js`:

| File | Description |
|------|-------------|
| `styles.js` | CSS styles for all panel components |
| `templates.js` | HTML templates for the panel and scheduler cards |
| `utils.js` | Utility functions (entity info, time formatting, icons, interpolation) |
| `graph.js` | Graph rendering and interaction handling (SVG, mouse/touch events) |
| `services.js` | Home Assistant service calls (apply, save, delete, load) |
| `panel-modular.js` | Main panel class that orchestrates everything |
| `build.js` | Build script to bundle all modules into panel.js |
| `panel.js` | **Output file** - bundled version loaded by Home Assistant |

## Development Workflow

1. **Edit the source modules** (`styles.js`, `templates.js`, `utils.js`, `graph.js`, `services.js`, `panel-modular.js`)

2. **Build the bundle**:
   ```bash
   cd /workspaces/core/config/custom_components/universal_scheduler/frontend
   node build.js
   ```

3. **Refresh Home Assistant** to see changes

## Why Bundling?

Home Assistant custom panels don't support ES modules (`import`/`export`) directly in the browser. The build script:
- Strips all `import` and `export` statements
- Wraps everything in an IIFE (Immediately Invoked Function Expression)
- Outputs a single `panel.js` file that works in the browser

## Module Descriptions

### styles.js
Contains the `PANEL_STYLES` constant with all CSS for:
- Panel layout and header
- Scheduler cards
- Graph container and grid
- Points and tooltips
- Modals and forms
- Pagination and filters

### templates.js
Contains:
- `PANEL_TEMPLATE` - Main panel HTML structure
- `createSchedulerCardHTML()` - Function to generate card HTML

### utils.js
Contains utility functions:
- `getEntityInfo()` - Auto-detect entity min/max/unit
- `getControllableEntities()` - List controllable domains
- `minutesToTime()` - Convert minutes to HH:MM
- `getDomainIcon()` - Get MDI icon for domain
- `interpolateValue()` - Calculate value on curve
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
- `loadSchedulersFromEntities()` - Load from switch entities

### panel-modular.js
Main `UniversalSchedulerPanel` class:
- Constructor with state initialization
- `init()` - Set up DOM and event listeners
- `setupEventListeners()` - Global event handlers
- `renderSchedulers()` - Render scheduler cards
- `createSchedulerCard()` - Create card elements
- Pagination and filtering
- Modal handling
