/**
 * Universal Scheduler - Styles Module
 * All CSS styles for the scheduler panel
 */

export const PANEL_STYLES = `
    .scheduler-panel {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        padding: 20px;
        box-sizing: border-box;
        overflow: hidden;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        flex-shrink: 0;
    }

    .header h2 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .header-buttons {
        display: flex;
        gap: 10px;
    }

    .global-settings {
        display: flex;
        gap: 15px;
        background: var(--card-background-color);
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 15px;
        align-items: center;
        flex-shrink: 0;
    }

    .setting-group {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 170px;
    }

    .setting-group label {
        font-size: 0.85rem;
        opacity: 0.8;
    }

    .setting-group select, .setting-group input {
        padding: 6px 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        min-width: 140px;
    }

    /* Search and Filter */
    .search-filter-bar {
        display: flex;
        gap: 15px;
        background: var(--card-background-color);
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 15px;
        align-items: center;
        flex-wrap: wrap;
    }

    .search-box {
        flex: 1;
        min-width: 200px;
        position: relative;
        order: 0;
    }

    .search-box input {
        width: 100%;
        padding: 8px 12px 8px 36px;
        border-radius: 6px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 0.9rem;
    }

    .search-box ha-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.5;
        pointer-events: none;
    }

    .filter-chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        order: 3;
    }

    .filter-chip {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .filter-chip:hover {
        border-color: var(--primary-color);
    }

    .filter-chip.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }

    .filter-chip ha-icon {
        --mdc-icon-size: 16px;
    }

    .filter-label {
        font-size: 0.85rem;
        opacity: 0.8;
        margin-right: 5px;
        order: 1;
    }

    .schedulers-container {
        flex: 1;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(var(--columns-count, 1), 1fr);
        gap: 20px;
        padding-right: 5px;
        align-content: start;
    }

    .scheduler-card {
        background: var(--card-background-color);
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: box-shadow 0.2s;
    }

    .scheduler-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .scheduler-card.collapsed .scheduler-body {
        display: none;
    }

    .scheduler-card .collapse-indicator {
        margin-left: auto;
        margin-right: 10px;
        opacity: 0.5;
        transition: transform 0.2s;
    }

    .scheduler-card.collapsed .collapse-indicator {
        transform: rotate(-90deg);
    }

    .scheduler-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--divider-color);
    }

    .scheduler-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        font-size: 1.1rem;
    }

    .scheduler-title .entity-icon {
        color: var(--primary-color);
    }

    .scheduler-controls {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .scheduler-settings {
        display: flex;
        gap: 15px;
        margin-bottom: 10px;
        flex-wrap: wrap;
        align-items: flex-end;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .input-group label {
        font-size: 0.75rem;
        opacity: 0.7;
        text-transform: uppercase;
    }

    .input-group input, .input-group select {
        padding: 8px 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 0.9rem;
    }

    .graph-wrapper {
        position: relative;
        height: var(--graph-height, 250px);
        margin-top: 10px;
    }

    .graph-y-axis {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 20px;
        width: 45px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 0.7rem;
        opacity: 0.6;
        text-align: right;
        padding-right: 5px;
    }

    .graph-container {
        position: absolute;
        left: 50px;
        right: 10px;
        top: 0;
        bottom: 20px;
        background: linear-gradient(180deg, rgba(var(--rgb-primary-color), 0.05) 0%, transparent 100%);
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--divider-color);
        touch-action: none; /* Prevent browser touch handling */
    }

    .graph-x-axis {
        position: absolute;
        left: 50px;
        right: 10px;
        bottom: 0;
        height: 20px;
        display: flex;
        justify-content: space-between;
        font-size: 0.7rem;
        opacity: 0.6;
    }

    .grid-lines {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .grid-line-h {
        position: absolute;
        width: 100%;
        border-top: 1px dashed rgba(255,255,255,0.1);
    }

    .grid-line-v {
        position: absolute;
        height: 100%;
        border-left: 1px dashed rgba(255,255,255,0.1);
    }

    .grid-line-v.major {
        border-left: 1px solid rgba(255,255,255,0.2);
    }

    svg.curve-svg {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    svg.curve-svg path {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 2.5px;
        vector-effect: non-scaling-stroke;
        filter: drop-shadow(0 0 3px var(--primary-color));
    }

    svg.curve-svg .fill-area {
        fill: rgba(var(--rgb-primary-color), 0.15);
        stroke: none;
    }

    .point {
        position: absolute;
        width: 14px;
        height: 14px;
        background: var(--primary-color);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        cursor: grab;
        border: 2px solid white;
        z-index: 10;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        transition: transform 0.1s, box-shadow 0.1s;
        touch-action: none;
    }

    .point:hover {
        transform: translate(-50%, -50%) scale(1.2);
        box-shadow: 0 3px 10px rgba(0,0,0,0.5);
    }

    .point.dragging {
        cursor: grabbing;
        transform: translate(-50%, -50%) scale(1.3);
    }

    .point-tooltip {
        position: absolute;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 0.8rem;
        white-space: nowrap;
        pointer-events: none;
        z-index: 100;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .point-tooltip.above {
        transform: translate(-50%, -100%);
        margin-top: -10px;
    }

    .point-tooltip.below {
        transform: translate(-50%, 0);
        margin-top: 10px;
    }

    .point-tooltip .time {
        font-weight: 600;
        color: var(--primary-color);
    }

    .point-tooltip .value {
        margin-left: 8px;
        opacity: 0.9;
    }

    .zoom-controls {
        display: flex;
        gap: 5px;
        align-items: center;
    }

    .zoom-controls button {
        width: 28px;
        height: 28px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .zoom-controls button:hover {
        background: var(--primary-color);
        color: white;
    }

    button.primary {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    button.primary:hover {
        filter: brightness(1.1);
    }

    button.danger {
        background: var(--error-color, #db4437);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
    }

    button.secondary {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
    }

    button.secondary:hover {
        background: var(--primary-color);
        color: white;
    }

    button.icon-only {
        padding: 8px 10px;
        min-width: 36px;
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    button.icon-only ha-icon {
        --mdc-icon-size: 18px;
    }

    /* Modal styles */
    .modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        z-index: 1000;
        align-items: center;
        justify-content: center;
    }

    .modal-overlay.show {
        display: flex;
    }

    .modal-dialog {
        background: var(--card-background-color);
        padding: 25px;
        border-radius: 12px;
        min-width: 400px;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .modal-dialog h3 {
        margin: 0 0 20px 0;
        color: var(--primary-text-color);
    }

    .modal-dialog .form-group {
        margin-bottom: 15px;
    }

    .modal-dialog label {
        display: block;
        margin-bottom: 5px;
        font-size: 0.85rem;
        opacity: 0.8;
    }

    .modal-dialog input, .modal-dialog select {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        box-sizing: border-box;
        font-size: 0.95rem;
    }

    .autocomplete-wrapper {
        position: relative;
    }

    .autocomplete-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        max-height: 200px;
        overflow-y: auto;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 0 0 6px 6px;
        z-index: 1001;
        display: none;
    }

    .autocomplete-list.show {
        display: block;
    }

    .autocomplete-item {
        padding: 10px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid var(--divider-color);
    }

    .autocomplete-item:last-child {
        border-bottom: none;
    }

    .autocomplete-item:hover {
        background: var(--secondary-background-color);
    }

    .autocomplete-item .domain-badge {
        background: var(--primary-color);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.7rem;
        text-transform: uppercase;
    }

    .entity-detected-info {
        margin-top: 10px;
        padding: 10px;
        background: rgba(var(--rgb-primary-color), 0.1);
        border-radius: 6px;
        font-size: 0.85rem;
    }

    .entity-detected-info .label {
        opacity: 0.7;
    }

    .entity-detected-info .value {
        font-weight: 600;
    }

    .modal-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }

    .coming-soon {
        text-align: center;
        padding: 40px 20px;
    }

    .coming-soon ha-icon {
        font-size: 48px;
        color: var(--primary-color);
        margin-bottom: 15px;
    }

    .coming-soon p {
        margin: 10px 0;
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        opacity: 0.6;
    }

    .empty-state ha-icon {
        font-size: 48px;
        margin-bottom: 15px;
    }

    .empty-state p {
        margin: 10px 0;
    }

    /* Toggle switch */
    .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        background: var(--divider-color);
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .toggle-switch.active {
        background: var(--primary-color);
    }

    .toggle-switch::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: transform 0.2s;
    }

    .toggle-switch.active::after {
        transform: translateX(20px);
    }

    /* Small toggle switch variant - same height as inputs */
    .toggle-switch.small {
        width: 50px;
        height: 28px;
        border-radius: 14px;
        margin-top: 3px;
    }

    .toggle-switch.small::after {
        width: 22px;
        height: 22px;
        top: 3px;
        left: 3px;
    }

    .toggle-switch.small.active::after {
        transform: translateX(22px);
    }

    /* Current time marker */
    .current-time-marker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--error-color, #db4437);
        z-index: 5;
        pointer-events: none;
    }

    .current-time-marker::before {
        content: 'NOW';
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.6rem;
        font-weight: 600;
        color: var(--error-color, #db4437);
        white-space: nowrap;
    }

    /* Curve hover tooltip */
    .curve-tooltip {
        position: absolute;
        background: var(--card-background-color);
        border: 1px solid var(--primary-color);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 0.8rem;
        white-space: nowrap;
        pointer-events: none;
        z-index: 100;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .curve-tooltip.above {
        transform: translate(-50%, -100%);
        margin-top: -15px;
    }

    .curve-tooltip.below {
        transform: translate(-50%, 0);
        margin-top: 15px;
    }

    .curve-tooltip .time {
        font-weight: 600;
        color: var(--primary-color);
    }

    .curve-tooltip .value {
        margin-left: 8px;
        opacity: 0.9;
    }

    /* Hover line indicator */
    .hover-line {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--primary-color);
        opacity: 0.5;
        pointer-events: none;
        z-index: 4;
    }

    .hover-dot {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 6;
    }

    /* Current value display */
    .current-value-display {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        background: rgba(var(--rgb-primary-color), 0.1);
        border-radius: 6px;
        font-size: 0.85rem;
        margin-top: 10px;
    }

    .current-value-display .label {
        opacity: 0.7;
    }

    .current-value-display .value {
        font-weight: 600;
        color: var(--primary-color);
    }

    .current-value-display button {
        margin-left: auto;
    }

    /* Pagination styles */
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding: 15px;
        flex-shrink: 0;
    }

    .pagination button {
        padding: 8px 16px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-radius: 4px;
        cursor: pointer;
    }

    .pagination button:hover:not(:disabled) {
        background: var(--primary-color);
        color: white;
    }

    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination .page-info {
        font-size: 0.9rem;
        opacity: 0.8;
    }

    /* Graph touch/mouse interaction */
    .graph-container {
        touch-action: none;
        user-select: none;
    }

    /* Graph controls hotdog menu */
    .graph-controls-menu {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 20;
        display: flex;
        align-items: center;
        flex-direction: row;
    }

    .graph-controls-menu.left-side {
        right: auto;
        left: 8px;
        flex-direction: row-reverse;
    }

    .graph-controls-toggle {
        width: 32px;
        height: 32px;
        border-radius: 16px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        transition: all 0.2s;
    }

    .graph-controls-toggle:hover {
        background: var(--primary-color);
        color: white;
    }

    .graph-controls-toggle ha-icon {
        --mdc-icon-size: 20px;
    }

    .graph-controls-panel {
        display: none;
        flex-direction: row;
        gap: 4px;
        margin-right: 8px;
        background: var(--card-background-color);
        padding: 4px 8px;
        border-radius: 16px;
        border: 1px solid var(--divider-color);
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        align-items: center;
    }

    .graph-controls-menu.left-side .graph-controls-panel {
        margin-right: 0;
        margin-left: 8px;
    }

    .graph-controls-panel.show {
        display: flex;
    }

    .graph-controls-panel button {
        width: 28px;
        height: 28px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        padding: 0;
    }

    .graph-controls-panel button:hover {
        background: var(--primary-color);
        color: white;
    }

    .graph-controls-panel .divider {
        width: 1px;
        height: 20px;
        background: var(--divider-color);
        margin: 0 6px;
        align-self: center;
    }

    .graph-controls-panel .undo-group,
    .graph-controls-panel .zoom-group,
    .graph-controls-panel .pan-group {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    /* Points list (expandable manual editor) */
    .points-editor {
        margin-top: 10px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
    }

    .points-editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .points-editor-header:hover {
        background: rgba(var(--rgb-primary-color), 0.1);
    }

    .points-editor-header ha-icon {
        --mdc-icon-size: 18px;
        opacity: 0.7;
        transition: transform 0.2s;
    }

    .points-editor.collapsed .points-editor-header ha-icon {
        transform: rotate(-90deg);
    }

    .points-editor-content {
        max-height: 250px;
        overflow-y: auto;
        border-top: 1px solid var(--divider-color);
    }

    .points-editor.collapsed .points-editor-content {
        display: none;
    }

    .points-clipboard-actions {
        display: flex;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(var(--rgb-primary-color), 0.03);
        border-bottom: 1px solid var(--divider-color);
    }

    .points-clipboard-actions button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
    }

    .point-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-bottom: 1px solid var(--divider-color);
        font-size: 0.85rem;
    }

    .point-row:last-child {
        border-bottom: none;
    }

    .point-row:hover {
        background: rgba(var(--rgb-primary-color), 0.05);
    }

    .point-row .point-index {
        width: 24px;
        text-align: center;
        opacity: 0.5;
        font-size: 0.75rem;
    }

    .point-row input {
        width: 70px;
        padding: 4px 6px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 0.85rem;
    }

    .point-row input:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .point-row .point-delete {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: var(--error-color, #db4437);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        opacity: 0.6;
    }

    .point-row .point-delete:hover {
        background: rgba(219, 68, 55, 0.1);
        opacity: 1;
    }

    .point-row .point-delete ha-icon {
        --mdc-icon-size: 16px;
    }

    .add-point-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--secondary-background-color);
    }

    .add-point-row button {
        padding: 4px 12px;
        font-size: 0.8rem;
    }

    /* Current value display enhancements */
    .current-value-display .actual-value {
        color: var(--primary-color);
    }

    .current-value-display .value-separator {
        opacity: 0.5;
        margin: 0 4px;
    }

    /* Graph Label Row */
    .graph-label-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 15px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        margin-bottom: 10px;
    }

    .graph-label-container {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
        overflow: hidden;
    }

    .graph-label-text {
        font-size: 0.9rem;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        max-width: 200px;
    }

    .graph-label-text.marquee {
        animation: marquee 8s linear infinite;
    }

    @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
    }

    .graph-label-edit {
        padding: 4px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--primary-color);
        opacity: 0.7;
        transition: opacity 0.2s;
        flex-shrink: 0;
    }

    .graph-label-edit:hover {
        opacity: 1;
    }

    .graph-label-edit ha-icon {
        --mdc-icon-size: 16px;
    }

    .graph-label-input {
        flex: 1;
        padding: 4px 8px;
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 0.9rem;
        display: none;
    }

    .graph-label-container.editing .graph-label-text,
    .graph-label-container.editing .graph-label-edit {
        display: none;
    }

    .graph-label-container.editing .graph-label-input {
        display: block;
    }

    .weekday-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
    }

    .weekday-selector label {
        font-size: 0.8rem;
        opacity: 0.7;
        white-space: nowrap;
    }

    .weekday-buttons {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .weekday-btn {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 0.75rem;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 36px;
        text-align: center;
    }

    .weekday-btn:hover {
        background: var(--secondary-background-color);
        border-color: var(--primary-color);
    }

    .weekday-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
    }

    /* Add Graph Section */
    .add-graph-section {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 15px;
        border-top: 1px solid var(--divider-color);
        margin-top: 10px;
    }

    .add-graph-btn {
        padding: 8px 20px;
        font-size: 0.85rem;
        gap: 8px;
    }

    .add-graph-btn ha-icon {
        --mdc-icon-size: 18px;
    }

    /* Scheduler body and top settings */
    .scheduler-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .scheduler-top-settings {
        display: flex;
        gap: 15px;
        padding: 8px 15px;
        background: var(--secondary-background-color);
        border-radius: 8px;
    }

    /* Multi-graph container */
    .graphs-container {
        display: grid;
        grid-template-columns: repeat(var(--graphs-per-row, 1), 1fr);
        gap: 15px;
    }

    /* Individual graph section */
    .graph-section {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
    }

    .graph-section .graph-label-row {
        margin-bottom: 0;
        border-radius: 0;
        cursor: pointer;
        transition: background 0.2s;
    }

    .graph-section .graph-label-row:hover {
        background: var(--primary-background-color);
    }

    .graph-section .graph-content {
        padding: 10px;
        border-top: 1px solid var(--divider-color);
    }

    .graph-section.collapsed .graph-content {
        display: none;
    }

    .graph-section .graph-collapse-indicator {
        transition: transform 0.2s;
        opacity: 0.5;
        flex-shrink: 0;
    }

    .graph-section.collapsed .graph-collapse-indicator {
        transform: rotate(-90deg);
    }

    /* Graph settings row (per-graph) */
    .graph-settings {
        display: flex;
        gap: 10px;
        padding: 8px 10px;
        background: var(--secondary-background-color);
        border-radius: 6px;
        margin-bottom: 10px;
        flex-wrap: wrap;
        align-items: center;
    }

    .graph-settings .input-group {
        margin: 0;
    }

    .graph-settings button.danger.small {
        margin-left: auto;
        padding: 4px 8px;
    }

    .graph-settings button.danger.small ha-icon {
        --mdc-icon-size: 16px;
    }

    /* Smaller graph within multi-graph layout */
    .graph-section .graph-wrapper {
        min-height: 150px;
    }

    .graph-section .current-value-display {
        margin-top: 8px;
        padding: 6px 10px;
        font-size: 0.85rem;
    }

    .graph-section .points-editor {
        margin-top: 8px;
    }

    /* ========== MOBILE RESPONSIVE STYLES ========== */
    @media screen and (max-width: 768px) {
        .scheduler-panel {
            padding: 10px;
        }

        .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }

        .header h2 {
            font-size: 1.2rem;
        }

        .header-buttons {
            width: 100%;
        }

        .header-buttons button {
            flex: 1;
        }

        /* Global settings - stack vertically on mobile */
        .global-settings {
            flex-direction: column;
            gap: 10px;
            padding: 10px;
        }

        .setting-group {
            width: 100%;
            justify-content: space-between;
        }

        .setting-group select, .setting-group input {
            flex: 1;
            min-width: 0;
        }

        /* Search bar */
        .search-filter-bar {
            flex-direction: column;
            gap: 10px;
            padding: 10px;
        }

        .search-box {
            width: 100%;
            min-width: 0;
        }

        .filter-chips {
            width: 100%;
            flex-wrap: wrap;
        }

        /* Scheduler cards */
        .scheduler-card {
            margin-bottom: 10px;
        }

        .scheduler-header {
            padding: 10px;
            flex-wrap: wrap;
            gap: 8px;
        }

        .scheduler-title {
            flex: 1 1 100%;
            font-size: 0.9rem;
        }

        .scheduler-controls {
            flex: 1 1 100%;
            justify-content: flex-end;
        }

        /* Graph settings - stack on mobile */
        .graph-settings {
            flex-direction: column;
            gap: 8px;
        }

        .graph-settings .input-group {
            width: 100%;
        }

        .graph-settings .input-group input,
        .graph-settings .input-group select {
            width: 100%;
        }

        /* Graph section header */
        .graph-label-row {
            padding: 8px 10px;
            flex-wrap: wrap;
            gap: 6px;
        }

        .graph-label-row .input-group.inline {
            flex: 1 1 auto;
            min-width: 80px;
        }

        .graph-label-row .input-group.inline input {
            width: 100%;
            font-size: 0.85rem;
        }

        /* Weekday buttons */
        .weekday-selector {
            width: 100%;
            justify-content: space-between;
        }

        .weekday-btn {
            padding: 6px 8px;
            font-size: 0.75rem;
            min-width: 32px;
        }

        /* Graph wrapper */
        .graph-wrapper {
            height: var(--graph-height, 200px);
        }

        .graph-y-axis {
            width: 35px;
            font-size: 0.6rem;
        }

        .graph-container {
            left: 40px;
            right: 5px;
        }

        .graph-x-axis {
            left: 40px;
            right: 5px;
            font-size: 0.6rem;
        }

        /* Current value display */
        .current-value-display {
            flex-wrap: wrap;
            gap: 8px;
            font-size: 0.8rem;
        }

        .current-value-display > span {
            flex: 1 1 45%;
        }

        .current-value-display {
            flex-direction: column;
            align-items: flex-start;
        }

        .current-value-display .value-separator {
            display: none;
        }

        .current-value-display > span {
            flex: 1 1 auto;
            width: 100%;
        }

        /* Points editor */
        .points-editor {
            padding: 8px;
        }

        .points-list {
            max-height: 150px;
        }

        .point-row {
            flex-wrap: wrap;
            gap: 6px;
            padding: 6px;
        }

        .point-row input {
            flex: 1;
            min-width: 60px;
        }

        /* Graph controls menu */
        .graph-controls-panel {
            min-width: auto;
            flex-wrap: wrap;
            max-width: calc(100% - 16px);
            justify-content: flex-start;
            row-gap: 4px;
        }

        .graph-controls-panel .undo-group {
            flex-basis: 100%;
            order: 2;
            justify-content: flex-start;
        }

        .graph-controls-panel .zoom-group,
        .graph-controls-panel .pan-group {
            order: 1;
        }

        .graph-controls-toggle {
            width: clamp(24px, 7vw, 28px);
            height: clamp(24px, 7vw, 28px);
            border-radius: 14px;
        }

        .graph-controls-toggle ha-icon {
            --mdc-icon-size: 18px;
        }

        .graph-controls-panel button {
            width: clamp(18px, 6vw, 24px);
            height: clamp(18px, 6vw, 24px);
            font-size: 0.8rem;
            flex: 0 0 auto;
        }

        /* Modal */
        .modal-content {
            width: 95%;
            max-width: none;
            margin: 10px;
            padding: 15px;
        }

        /* Pagination */
        .pagination {
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
        }

        .pagination button {
            padding: 8px 12px;
            font-size: 0.85rem;
        }
    }

    /* Extra small screens */
    @media screen and (max-width: 480px) {
        .scheduler-panel {
            padding: 8px;
        }

        .header h2 {
            font-size: 1rem;
        }

        .setting-group label {
            font-size: 0.75rem;
        }

        .graph-wrapper {
            height: var(--graph-height, 180px);
        }

        .graph-y-axis {
            width: 30px;
            font-size: 0.55rem;
        }

        .graph-container {
            left: 35px;
        }

        .graph-x-axis {
            left: 35px;
            font-size: 0.55rem;
        }

        /* Extra-small: keep hotdog controls inside graph area */
        .graph-controls-menu {
            right: 4px;
            top: 4px;
        }

        .graph-controls-toggle {
            width: clamp(20px, 8vw, 24px);
            height: clamp(20px, 8vw, 24px);
            border-radius: 12px;
        }

        .graph-controls-toggle ha-icon {
            --mdc-icon-size: 16px;
        }

        .graph-controls-panel {
            padding: 3px 6px;
            gap: 3px;
            border-radius: 12px;
            max-width: calc(100% - 12px);
            flex-wrap: wrap;
            justify-content: flex-start;
            row-gap: 3px;
        }

        .graph-controls-panel .undo-group {
            flex-basis: 100%;
            order: 2;
            justify-content: flex-start;
        }

        .graph-controls-panel .zoom-group,
        .graph-controls-panel .pan-group {
            order: 1;
        }

        .graph-controls-panel button {
            width: clamp(16px, 7vw, 20px);
            height: clamp(16px, 7vw, 20px);
            font-size: 0.75rem;
            flex: 0 0 auto;
        }

        .weekday-btn {
            padding: 8px 6px;
            font-size: 0.7rem;
            min-width: 28px;
        }
    }

    /* Ultra-narrow screens: break control groups across lines and hide divider when wrapping */
    @media screen and (max-width: 768px) {
        .graph-controls-panel .divider {
            flex-basis: 100%;
            height: 0;
            margin: 0;
            border: 0;
            visibility: hidden;
        }
    }

    /* Touch device optimizations */
    @media (hover: none) and (pointer: coarse) {
        button, .btn {
            min-height: 44px;
            min-width: 44px;
        }

        .weekday-btn {
            min-height: 40px;
        }

        /* Keep graph hotdog menu buttons compact on touch */
        .graph-controls-toggle {
            min-width: 14px;
            min-height: 14px;
            width: 28px;
            height: 28px;
        }

        .graph-controls-panel button {
            min-width: 12px;
            min-height: 12px;
            width: 24px;
            height: 24px;
        }

        /* Disable hover effects that can be sticky on touch */
        .point:hover {
            transform: none;
        }

        .graph-label-row:hover {
            background: inherit;
        }
    }
`;
