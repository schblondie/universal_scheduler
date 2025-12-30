/**
 * Universal Scheduler Panel (Bundled)
 * Multi-entity scheduler with curve interpolation
 *
 * Auto-generated from modular source files
 * Do not edit directly - edit the source modules instead:
 * - styles.js
 * - templates.js
 * - utils.js
 * - attribute-config.js
 * - graph.js
 * - services.js
 * - panel-modular.js
 *
 * Then run: python build.py
 */

(function() {
'use strict';

// === STYLES ===
/**
 * Universal Scheduler - Styles Module
 * All CSS styles for the scheduler panel
 */

const PANEL_STYLES = `
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



// === TEMPLATES ===
/**
 * Universal Scheduler - Templates Module
 * HTML templates for the scheduler panel
 */

const PANEL_TEMPLATE = `
    <div class="header">
        <h2>
            <ha-icon icon="mdi:chart-bell-curve-cumulative"></ha-icon>
            Universal Scheduler
        </h2>
        <div class="header-buttons">
            <button class="primary" id="createBtn">
                <ha-icon icon="mdi:plus"></ha-icon>
                Create Scheduler
            </button>
        </div>
    </div>

    <div class="global-settings">
        <div class="setting-group">
            <label>X-Snap:</label>
            <select id="globalSnapSelect">
                <option value="0">Off</option>
                <option value="5">5 min</option>
                <option value="10">10 min</option>
                <option value="15">15 min</option>
                <option value="30" selected>30 min</option>
                <option value="60">1 hour</option>
            </select>
        </div>
        <div class="setting-group">
            <label>Graph Display:</label>
            <select id="graphDisplayMode">
                <option value="single" selected>One at a time</option>
                <option value="toggle">Click to toggle</option>
                <option value="all">Show all</option>
            </select>
        </div>
        <div class="setting-group">
            <label>Per Page:</label>
            <select id="itemsPerPage">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="30" selected>30</option>
                <option value="100">100</option>
                <option value="0">Unlimited</option>
            </select>
        </div>
        <div class="setting-group">
            <label>Columns:</label>
            <select id="columnsCount">
                <option value="1" selected>1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
            </select>
        </div>
        <div class="setting-group">
            <label>Graph Height:</label>
            <select id="graphHeight">
                <option value="150">150px</option>
                <option value="200">200px</option>
                <option value="250" selected>250px</option>
                <option value="300">300px</option>
                <option value="400">400px</option>
                <option value="500">500px</option>
            </select>
        </div>
    </div>

    <div class="search-filter-bar">
        <div class="search-box">
            <ha-icon icon="mdi:magnify"></ha-icon>
            <input type="text" id="searchInput" placeholder="Search schedulers by name or entity...">
        </div>
        <span class="filter-label">Filter:</span>
        <div class="filter-chips" id="filterChips">
            <!-- Chips will be dynamically populated -->
        </div>
    </div>

    <div class="schedulers-container" id="schedulersContainer">
        <div class="empty-state" id="emptyState">
            <ha-icon icon="mdi:calendar-clock"></ha-icon>
            <p>No schedulers configured yet</p>
            <p>Click "Create Scheduler" to add your first schedule curve</p>
        </div>
    </div>

    <div class="pagination" id="pagination" style="display: none;">
        <button id="prevPage" disabled>◀ Previous</button>
        <span class="page-info" id="pageInfo">Page 1 of 1</span>
        <button id="nextPage" disabled>Next ▶</button>
    </div>

    <!-- Create Scheduler Modal -->
    <div class="modal-overlay" id="createModal">
        <div class="modal-dialog">
            <h3>Create New Scheduler</h3>

            <div class="form-group">
                <label>Target Entity</label>
                <div class="autocomplete-wrapper">
                    <input type="text" id="modalEntityInput" placeholder="Start typing entity name..." autocomplete="off">
                    <div class="autocomplete-list" id="modalAutocomplete"></div>
                </div>
            </div>

            <div class="entity-detected-info" id="modalEntityInfo" style="display: none;">
                <div><span class="label">Type:</span> <span class="value" id="modalDetectedType">-</span></div>
                <div><span class="label">Range:</span> <span class="value" id="modalDetectedRange">-</span></div>
            </div>

            <div class="form-group">
                <label>Scheduler Name (optional)</label>
                <input type="text" id="modalNameInput" placeholder="Leave empty to use entity name">
            </div>

            <div class="form-group">
                <label>Interpolation Mode</label>
                <select id="modalModeSelect">
                    <option value="linear">Linear</option>
                    <option value="smooth">Smooth (Cosine)</option>
                    <option value="step">Step</option>
                </select>
            </div>

            <div class="modal-buttons">
                <button class="secondary" id="modalCancelBtn">Cancel</button>
                <button class="primary" id="modalConfirmBtn">Create</button>
            </div>
        </div>
    </div>

    <!-- Settings Modal -->
    <div class="modal-overlay" id="settingsModal">
        <div class="modal-dialog">
            <h3>Scheduler Settings</h3>
            <div class="coming-soon">
                <ha-icon icon="mdi:wrench-clock"></ha-icon>
                <p>Coming soon!</p>
                <p style="opacity: 0.7; font-size: 0.9rem;">Advanced scheduler settings will be available here.</p>
            </div>
            <div class="modal-buttons">
                <button class="secondary" id="settingsCloseBtn">Close</button>
            </div>
        </div>
    </div>
`;

/**
 * Generate HTML for a single graph section
 */
function createGraphHTML(graph, graphIndex, scheduler) {
    const attributes = scheduler.availableAttributes || [];
    const attributeOptions = [`<option value="" ${!graph.attribute ? 'selected' : ''}>State</option>`]
        .concat(
            attributes.map(attr => `<option value="${attr}" ${graph.attribute === attr ? 'selected' : ''}>${attr}</option>`)
        ).join('');

    const ySnapValue = graph.ySnap ?? 0;
    const isOpen = graph.isOpen ? '' : 'collapsed';

    return `
        <div class="graph-section ${isOpen}" data-graph-id="${graph.id}" data-graph-index="${graphIndex}">
            <div class="graph-label-row" data-action="toggleGraph">
                <div class="graph-label-container">
                    <ha-icon class="graph-collapse-indicator" icon="mdi:chevron-down"></ha-icon>
                    <span class="graph-label-text" data-graph-label>${graph.label || 'Schedule ' + (graphIndex + 1)}</span>
                    <input type="text" class="graph-label-input" data-graph-label-input value="${graph.label || 'Schedule ' + (graphIndex + 1)}">
                    <button class="graph-label-edit" data-action="editGraphLabel" title="Edit label" onclick="event.stopPropagation()">
                        <ha-icon icon="mdi:pencil"></ha-icon>
                    </button>
                </div>
                <div class="weekday-selector" onclick="event.stopPropagation()">
                    <div class="weekday-buttons">
                        <button class="weekday-btn ${(graph.weekdays || [0,1,2,3,4,5,6]).includes(1) ? 'active' : ''}" data-weekday="1">Mo</button>
                        <button class="weekday-btn ${(graph.weekdays || [0,1,2,3,4,5,6]).includes(2) ? 'active' : ''}" data-weekday="2">Tu</button>
                        <button class="weekday-btn ${(graph.weekdays || [0,1,2,3,4,5,6]).includes(3) ? 'active' : ''}" data-weekday="3">We</button>
                        <button class="weekday-btn ${(graph.weekdays || [0,1,2,3,4,5,6]).includes(4) ? 'active' : ''}" data-weekday="4">Th</button>
                        <button class="weekday-btn ${(graph.weekdays || [0,1,2,3,4,5,6]).includes(5) ? 'active' : ''}" data-weekday="5">Fr</button>
                        <button class="weekday-btn ${(graph.weekdays || [0,1,2,3,4,5,6]).includes(6) ? 'active' : ''}" data-weekday="6">Sa</button>
                        <button class="weekday-btn ${(graph.weekdays || [0,1,2,3,4,5,6]).includes(0) ? 'active' : ''}" data-weekday="0">Su</button>
                    </div>
                </div>
            </div>

            <div class="graph-content">
                <div class="graph-settings">
                    <div class="input-group">
                        <label>Mode</label>
                        <select data-graph-setting="mode">
                            <option value="linear" ${graph.mode === 'linear' ? 'selected' : ''}>Linear</option>
                            <option value="smooth" ${graph.mode === 'smooth' ? 'selected' : ''}>Smooth</option>
                            <option value="step" ${graph.mode === 'step' ? 'selected' : ''}>Step</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Step to 0</label>
                        <div class="toggle-switch small ${graph.stepToZero ? 'active' : ''}" data-graph-setting="stepToZero"></div>
                    </div>
                    <div class="input-group">
                        <label>Y-Min</label>
                        <input type="number" data-graph-setting="minY" value="${graph.minY}" style="width: 70px;">
                    </div>
                    <div class="input-group">
                        <label>Y-Max</label>
                        <input type="number" data-graph-setting="maxY" value="${graph.maxY}" style="width: 70px;">
                    </div>
                    <div class="input-group">
                        <label>Y-Snap</label>
                        <select data-graph-setting="ySnap">
                            <option value="0" ${ySnapValue === 0 ? 'selected' : ''}>Off</option>
                            <option value="0.1" ${ySnapValue === 0.1 ? 'selected' : ''}>0.1</option>
                            <option value="0.5" ${ySnapValue === 0.5 ? 'selected' : ''}>0.5</option>
                            <option value="1" ${ySnapValue === 1 ? 'selected' : ''}>1</option>
                            <option value="5" ${ySnapValue === 5 ? 'selected' : ''}>5</option>
                            <option value="10" ${ySnapValue === 10 ? 'selected' : ''}>10</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>X-Snap</label>
                        <select data-graph-setting="xSnap">
                            <option value="" ${graph.xSnap === undefined || graph.xSnap === null ? 'selected' : ''}>Global</option>
                            <option value="0" ${graph.xSnap === 0 ? 'selected' : ''}>Off</option>
                            <option value="1" ${graph.xSnap === 1 ? 'selected' : ''}>1 min</option>
                            <option value="5" ${graph.xSnap === 5 ? 'selected' : ''}>5 min</option>
                            <option value="10" ${graph.xSnap === 10 ? 'selected' : ''}>10 min</option>
                            <option value="15" ${graph.xSnap === 15 ? 'selected' : ''}>15 min</option>
                            <option value="30" ${graph.xSnap === 30 ? 'selected' : ''}>30 min</option>
                            <option value="60" ${graph.xSnap === 60 ? 'selected' : ''}>1 hour</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Attribute</label>
                        <select data-graph-setting="attribute">
                            ${attributeOptions}
                        </select>
                    </div>
                    <button class="danger small" data-action="deleteGraph" title="Delete this graph">
                        <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                </div>

                <div class="graph-wrapper">
                    <div class="graph-y-axis"></div>
                    <div class="graph-container" data-graph>
                        <div class="grid-lines"></div>
                        <svg class="curve-svg">
                            <path class="fill-area"></path>
                            <path class="curve-line"></path>
                        </svg>
                        <div class="current-time-marker" data-time-marker></div>
                        <div class="graph-controls-menu ${graph.controlsLeft ? 'left-side' : ''}">
                            <div class="graph-controls-panel">
                                <div class="undo-group">
                                    <button data-action="undo" title="Undo">↶</button>
                                    <button data-action="redo" title="Redo">↷</button>
                                </div>
                                <div class="divider"></div>
                                <div class="zoom-group">
                                    <button data-action="zoomIn" title="Zoom In">+</button>
                                    <button data-action="zoomOut" title="Zoom Out">−</button>
                                    <button data-action="zoomReset" title="Reset View">⟲</button>
                                </div>
                                <div class="divider"></div>
                                <div class="pan-group">
                                    <button data-action="panLeft" title="Pan Left">◀</button>
                                    <button data-action="panRight" title="Pan Right">▶</button>
                                </div>
                            </div>
                            <div class="graph-controls-toggle" data-action="toggleControls" title="Graph Controls">
                                <ha-icon icon="mdi:dots-horizontal"></ha-icon>
                            </div>
                        </div>
                    </div>
                    <div class="graph-x-axis"></div>
                </div>

                <div class="current-value-display">
                    <span class="label">Current:</span>
                    <span class="actual-value" data-actual-value>--</span>
                    <span class="value-separator">|</span>
                    <span class="label">Next:</span>
                    <span class="value" data-next-value>--</span>
                    <button class="secondary" data-action="applyNow">
                        <ha-icon icon="mdi:play"></ha-icon> Apply
                    </button>
                </div>

                <div class="points-editor collapsed" data-points-editor>
                    <div class="points-editor-header" data-action="togglePointsEditor">
                        <span>Edit Points (${(graph.points || []).length})</span>
                        <ha-icon icon="mdi:chevron-down"></ha-icon>
                    </div>
                    <div class="points-editor-content">
                        <div class="points-clipboard-actions">
                            <button class="secondary small" data-action="copyPoints" title="Copy points to clipboard">
                                <ha-icon icon="mdi:content-copy"></ha-icon> Copy
                            </button>
                            <button class="secondary small" data-action="pastePoints" title="Paste points from clipboard">
                                <ha-icon icon="mdi:content-paste"></ha-icon> Paste
                            </button>
                        </div>
                        <div class="points-list" data-points-list>
                            <!-- Points will be rendered dynamically -->
                        </div>
                        <div class="add-point-row">
                            <input type="text" data-new-point-time placeholder="Time (HH:MM)" style="width: 80px;">
                            <input type="number" data-new-point-value placeholder="Value" style="width: 70px;">
                            <button class="secondary" data-action="addPoint">
                                <ha-icon icon="mdi:plus"></ha-icon> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate scheduler card HTML (multi-graph version)
 */
function createSchedulerCardHTML(scheduler, domainIcon) {
    // Generate HTML for all graphs
    const graphsHTML = (scheduler.graphs || []).map((graph, index) =>
        createGraphHTML(graph, index, scheduler)
    ).join('');

    return `
        <div class="scheduler-header" data-action="toggleCollapse">
            <div class="scheduler-title">
                <ha-icon class="entity-icon" icon="${domainIcon}"></ha-icon>
                <span class="title-text">${scheduler.name}</span>
                <span style="opacity: 0.5; font-size: 0.8rem;">(${scheduler.entityId})</span>
            </div>
            <ha-icon class="collapse-indicator" icon="mdi:chevron-down"></ha-icon>
            <div class="scheduler-controls" onclick="event.stopPropagation()">
                <div class="toggle-switch ${scheduler.enabled ? 'active' : ''}" data-action="toggle"></div>
                <button class="secondary icon-only" data-action="settings" title="Settings">
                    <ha-icon icon="mdi:cog"></ha-icon>
                </button>
                <button class="secondary" data-action="save">
                    <ha-icon icon="mdi:content-save"></ha-icon> Save
                </button>
                <button class="danger" data-action="delete">
                    <ha-icon icon="mdi:delete"></ha-icon>
                </button>
            </div>
        </div>

        <div class="scheduler-body">
            <div class="scheduler-top-settings">
                <div class="input-group">
                    <label>Update Interval</label>
                    <select data-setting="updateInterval">
                        <option value="1" ${scheduler.updateInterval === 1 ? 'selected' : ''}>1 s</option>
                        <option value="5" ${scheduler.updateInterval === 5 ? 'selected' : ''}>5 s</option>
                        <option value="10" ${scheduler.updateInterval === 10 ? 'selected' : ''}>10 s</option>
                        <option value="30" ${scheduler.updateInterval === 30 ? 'selected' : ''}>30 s</option>
                        <option value="60" ${scheduler.updateInterval === 60 ? 'selected' : ''}>1 min</option>
                        <option value="300" ${(scheduler.updateInterval === 300 || !scheduler.updateInterval) ? 'selected' : ''}>5 min</option>
                        <option value="600" ${scheduler.updateInterval === 600 ? 'selected' : ''}>10 min</option>
                        <option value="900" ${scheduler.updateInterval === 900 ? 'selected' : ''}>15 min</option>
                        <option value="1800" ${scheduler.updateInterval === 1800 ? 'selected' : ''}>30 min</option>
                        <option value="3600" ${scheduler.updateInterval === 3600 ? 'selected' : ''}>1 hour</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Graphs/Row</label>
                    <select data-setting="graphsPerRow">
                        <option value="1" ${(scheduler.graphsPerRow || 1) === 1 ? 'selected' : ''}>1</option>
                        <option value="2" ${scheduler.graphsPerRow === 2 ? 'selected' : ''}>2</option>
                        <option value="3" ${scheduler.graphsPerRow === 3 ? 'selected' : ''}>3</option>
                    </select>
                </div>
            </div>

            <div class="graphs-container" style="--graphs-per-row: ${scheduler.graphsPerRow || 1}">
                ${graphsHTML}
            </div>

            <div class="add-graph-section">
                <button class="secondary add-graph-btn" data-action="addGraph">
                    <ha-icon icon="mdi:plus"></ha-icon> Add Graph
                </button>
            </div>
        </div>
    `;
}



// === UTILITIES ===
/**
 * Universal Scheduler - Utilities Module
 * Helper functions for entity info, time formatting, icons, and interpolation
 */

// Controllable domains for scheduler
const CONTROLLABLE_DOMAINS = [
    'light', 'climate', 'number', 'input_number',
    'fan', 'cover', 'humidifier', 'media_player'
];

/**
 * Get entity domain and auto-detect min/max values
 */
function getEntityInfo(hass, entityId) {
    if (!entityId || !hass?.states[entityId]) {
        return { domain: 'number', minY: 0, maxY: 100, unit: '' };
    }

    const state = hass.states[entityId];
    const domain = entityId.split('.')[0];
    const attrs = state.attributes || {};

    let minY = 0, maxY = 100, unit = '';

    switch (domain) {
        case 'light':
            minY = 0;
            maxY = 100;
            unit = '%';
            break;
        case 'climate':
            minY = attrs.min_temp ?? 10;
            maxY = attrs.max_temp ?? 30;
            unit = attrs.temperature_unit || '°C';
            break;
        case 'number':
        case 'input_number':
            minY = attrs.min ?? 0;
            maxY = attrs.max ?? 100;
            unit = attrs.unit_of_measurement || '';
            break;
        case 'fan':
            minY = 0;
            maxY = 100;
            unit = '%';
            break;
        case 'cover':
            minY = 0;
            maxY = 100;
            unit = '%';
            break;
        case 'humidifier':
            minY = attrs.min_humidity ?? 0;
            maxY = attrs.max_humidity ?? 100;
            unit = '%';
            break;
        default:
            minY = attrs.min ?? 0;
            maxY = attrs.max ?? 100;
            unit = attrs.unit_of_measurement || '';
    }

    return { domain, minY, maxY, unit };
}

/**
 * Get all controllable entities for autocomplete
 */
function getControllableEntities(hass) {
    if (!hass?.states) return [];

    return Object.keys(hass.states)
        .filter(entityId => {
            const domain = entityId.split('.')[0];
            return CONTROLLABLE_DOMAINS.includes(domain);
        })
        .sort();
}

/**
 * Get numeric attributes for an entity (to allow selecting which attribute to graph)
 */
function getNumericAttributes(hass, entityId) {
    const state = hass?.states?.[entityId];
    if (!state || !state.attributes) return [];

    return Object.entries(state.attributes)
        .filter(([, value]) => typeof value === 'number')
        .map(([key]) => key)
        .sort();
}

/**
 * Convert minutes to HH:MM time string
 */
function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Parse HH:MM time string to minutes
 * Returns null if invalid format
 */
function timeToMinutes(timeStr) {
    if (!timeStr) return null;

    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);

    if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;

    return hours * 60 + mins;
}

/**
 * Get domain-specific icon
 */
function getDomainIcon(domain) {
    const icons = {
        'light': 'mdi:lightbulb',
        'climate': 'mdi:thermostat',
        'number': 'mdi:numeric',
        'input_number': 'mdi:ray-vertex',
        'fan': 'mdi:fan',
        'cover': 'mdi:window-shutter',
        'humidifier': 'mdi:air-humidifier',
        'media_player': 'mdi:speaker'
    };
    return icons[domain] || 'mdi:help-circle';
}

/**
 * Generate interpolated path points
 * If stepToZero is enabled and a point has y=0, the line will step down to 0 immediately
 */
function generateInterpolatedPath(scheduler, startMinute, endMinute) {
    const points = scheduler.points;
    const mode = scheduler.mode;
    const stepToZero = scheduler.stepToZero || false;
    const result = [];
    const step = Math.max(1, Math.floor((endMinute - startMinute) / 200)); // ~200 points for smooth curve

    // In step mode we want vertical transitions exactly at change boundaries
    if (mode === 'step' && !stepToZero) {
        return generateStepPath(points, startMinute, endMinute, scheduler.minY, scheduler.maxY);
    }

    // If stepToZero is enabled, we need to handle zero points specially
    if (stepToZero) {
        for (let x = startMinute; x <= endMinute; x += step) {
            const y = interpolateValueWithStepToZero(x, points, mode, scheduler.minY, scheduler.maxY);
            result.push({ x, y });
        }
    } else {
        for (let x = startMinute; x <= endMinute; x += step) {
            const y = interpolateValue(x, points, mode, scheduler.minY, scheduler.maxY);
            result.push({ x, y });
        }
    }

    // Ensure end point is included
    if (result.length === 0 || result[result.length - 1].x !== endMinute) {
        const y = stepToZero
            ? interpolateValueWithStepToZero(endMinute, points, mode, scheduler.minY, scheduler.maxY)
            : interpolateValue(endMinute, points, mode, scheduler.minY, scheduler.maxY);
        result.push({ x: endMinute, y });
    }

    return result;
}

// Build a step-path with explicit vertical transitions at change points
function generateStepPath(points, startMinute, endMinute, minY, maxY) {
    if (!points?.length) {
        return [
            { x: startMinute, y: minY },
            { x: endMinute, y: minY },
        ];
    }

    const sorted = [...points].sort((a, b) => a.x - b.x);
    const valueAt = (x) => interpolateValue(x, sorted, 'step', minY, maxY);

    const path = [];
    let lastY = valueAt(startMinute);

    path.push({ x: startMinute, y: lastY });

    for (const p of sorted) {
        if (p.x <= startMinute) {
            lastY = p.y;
            continue;
        }
        if (p.x > endMinute) {
            break;
        }

        // Horizontal segment to the change point
        path.push({ x: p.x, y: lastY });
        // Vertical jump at the change point
        path.push({ x: p.x, y: p.y });
        lastY = p.y;
    }

    // Extend to end of view
    path.push({ x: endMinute, y: lastY });

    return path;
}

/**
 * Interpolate value at a given x position
 */
function interpolateValue(x, points, mode, minY, maxY) {
    if (points.length === 0) return minY;
    if (points.length === 1) return points[0].y;

    // Find surrounding points
    let p1 = points[0];
    let p2 = points[points.length - 1];

    for (let i = 0; i < points.length - 1; i++) {
        if (x >= points[i].x && x <= points[i + 1].x) {
            p1 = points[i];
            p2 = points[i + 1];
            break;
        }
    }

    // Handle edge cases
    if (x <= points[0].x) return points[0].y;
    if (x >= points[points.length - 1].x) return points[points.length - 1].y;

    const t = (x - p1.x) / (p2.x - p1.x);

    switch (mode) {
        case 'step':
            return p1.y;

        case 'smooth':
            // Cosine interpolation
            const t2 = (1 - Math.cos(t * Math.PI)) / 2;
            return p1.y + (p2.y - p1.y) * t2;

        case 'linear':
        default:
            return p1.y + (p2.y - p1.y) * t;
    }
}

/**
 * Interpolate with step-to-zero behavior
 * When stepToZero is enabled and a point has y=0, the line will immediately drop to 0
 * instead of interpolating down to it
 */
function interpolateValueWithStepToZero(x, points, mode, minY, maxY) {
    if (points.length === 0) return minY;
    if (points.length === 1) return points[0].y;

    // Find surrounding points
    let p1 = points[0];
    let p2 = points[points.length - 1];
    let p1Index = 0;

    for (let i = 0; i < points.length - 1; i++) {
        if (x >= points[i].x && x <= points[i + 1].x) {
            p1 = points[i];
            p2 = points[i + 1];
            p1Index = i;
            break;
        }
    }

    // Handle edge cases
    if (x <= points[0].x) return points[0].y;
    if (x >= points[points.length - 1].x) return points[points.length - 1].y;

    // Step-to-zero logic: if next point is 0, return 0 immediately
    // Or if current point is 0, return 0 until we hit next point
    if (p2.y === 0 || p2.y === minY) {
        return 0; // Step down to zero immediately before a zero point
    }
    if (p1.y === 0 || p1.y === minY) {
        // If coming from zero, step up immediately at the exact point
        const t = (x - p1.x) / (p2.x - p1.x);
        if (t < 0.01) return 0; // Still at zero until just past the point
        return interpolateValue(x, points, mode, minY, maxY); // Then interpolate normally
    }

    // Otherwise, use normal interpolation
    return interpolateValue(x, points, mode, minY, maxY);
}

/**
 * Parse points data from various formats
 */
function parsePoints(pointsData) {
    if (Array.isArray(pointsData)) {
        return pointsData.map(p => ({
            x: p.x ?? p.time ?? 0,
            y: p.y ?? p.value ?? 0
        }));
    }
    return [{ x: 0, y: 0 }, { x: 1440, y: 0 }];
}

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}



// === ATTRIBUTE CONFIG ===
/**
 * Universal Scheduler - Attribute Configuration
 *
 * Defines attribute-specific settings like units and ranges.
 * Add new attribute configurations here to extend support.
 */

/**
 * Attribute configuration map
 *
 * Each entry defines:
 * - unit: The unit to display for this attribute
 * - minY: Default minimum value (can be overridden by entity attributes)
 * - maxY: Default maximum value (can be overridden by entity attributes)
 * - minAttr: Entity attribute name for min value (optional)
 * - maxAttr: Entity attribute name for max value (optional)
 *
 * Add new attributes by adding entries to this object.
 */
const ATTRIBUTE_CONFIG = {
    // Light attributes
    brightness: {
        unit: '',
        minY: 0,
        maxY: 255
    },
    color_temp: {
        unit: 'mireds',
        minY: 153,  // ~6500K
        maxY: 500,  // ~2000K
        minAttr: 'min_mireds',
        maxAttr: 'max_mireds'
    },
    color_temp_kelvin: {
        unit: 'K',
        minY: 2000,
        maxY: 6500,
        minAttr: 'min_color_temp_kelvin',
        maxAttr: 'max_color_temp_kelvin'
    },

    // Climate attributes
    temperature: {
        unit: '°C',
        minY: 10,
        maxY: 30,
        minAttr: 'min_temp',
        maxAttr: 'max_temp'
    },
    humidity: {
        unit: '%',
        minY: 0,
        maxY: 100,
        minAttr: 'min_humidity',
        maxAttr: 'max_humidity'
    },

    // Fan attributes
    percentage: {
        unit: '%',
        minY: 0,
        maxY: 100
    },

    // Cover attributes
    current_position: {
        unit: '%',
        minY: 0,
        maxY: 100
    },
    current_tilt_position: {
        unit: '%',
        minY: 0,
        maxY: 100
    },

    // Media player attributes
    volume_level: {
        unit: '%',
        minY: 0,
        maxY: 100
    },

    // Generic numeric attributes (add more as needed)
    // Example:
    // my_custom_attribute: {
    //     unit: 'units',
    //     minY: 0,
    //     maxY: 100,
    //     minAttr: 'min_custom',  // optional
    //     maxAttr: 'max_custom'   // optional
    // }
};

/**
 * Get attribute configuration
 *
 * @param {string} attributeName - The attribute name
 * @returns {object|null} The attribute config or null if not found
 */
function getAttributeConfig(attributeName) {
    return ATTRIBUTE_CONFIG[attributeName] || null;
}

/**
 * Get unit for an attribute
 *
 * @param {string} attributeName - The attribute name
 * @param {string} defaultUnit - Default unit if attribute is not configured
 * @returns {string} The unit string
 */
function getAttributeUnit(attributeName, defaultUnit = '') {
    const config = ATTRIBUTE_CONFIG[attributeName];
    return config ? config.unit : defaultUnit;
}

/**
 * Get range for an attribute, considering entity attributes
 *
 * @param {string} attributeName - The attribute name
 * @param {object} entityAttrs - Entity attributes object from Home Assistant
 * @param {object} defaultRange - Default range {minY, maxY} if attribute is not configured
 * @returns {object} Range object {minY, maxY}
 */
function getAttributeRange(attributeName, entityAttrs = {}, defaultRange = { minY: 0, maxY: 100 }) {
    const config = ATTRIBUTE_CONFIG[attributeName];

    if (!config) {
        return defaultRange;
    }

    let minY = config.minY;
    let maxY = config.maxY;

    // Override with entity-specific min/max if available
    if (config.minAttr && entityAttrs[config.minAttr] !== undefined) {
        minY = entityAttrs[config.minAttr];
    }
    if (config.maxAttr && entityAttrs[config.maxAttr] !== undefined) {
        maxY = entityAttrs[config.maxAttr];
    }

    return { minY, maxY };
}

/**
 * Check if an attribute has known configuration
 *
 * @param {string} attributeName - The attribute name
 * @returns {boolean} True if attribute is configured
 */
function isKnownAttribute(attributeName) {
    return attributeName in ATTRIBUTE_CONFIG;
}



// === GRAPH HANDLER ===
/**
 * Universal Scheduler - Graph Module
 * Graph rendering, mouse/touch interactions, and visual updates
 */


/**
 * Graph rendering and interaction handler
 */
class GraphHandler {
    constructor(panel) {
        this.panel = panel;
    }

    get schedulers() {
        return this.panel.schedulers;
    }

    get globalSnapMinutes() {
        return this.panel.globalSnapMinutes;
    }

    /**
     * Render the graph for a scheduler
     */
    renderGraph(entityId) {
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        if (!card) return;

        const scheduler = this.schedulers[entityId];
        const graph = card.querySelector('[data-graph]');
        const svg = card.querySelector('.curve-svg');
        const curvePath = svg.querySelector('.curve-line');
        const fillPath = svg.querySelector('.fill-area');

        // Clear existing points
        card.querySelectorAll('.point, .point-tooltip').forEach(el => el.remove());

        // Sort points by x
        scheduler.points.sort((a, b) => a.x - b.x);

        // Calculate visible range
        const visibleMinutes = 1440 / scheduler.zoomLevel;
        const startMinute = scheduler.zoomOffset;
        const endMinute = startMinute + visibleMinutes;
        const yRange = scheduler.maxY - scheduler.minY;

        // Generate interpolated path
        const pathPoints = generateInterpolatedPath(scheduler, startMinute, endMinute);

        // Use viewBox coordinates (0-100 for both axes) to make it resolution-independent
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');

        let pathD = '';
        let fillD = '';

        pathPoints.forEach((p, i) => {
            // Use percentage coordinates (0-100)
            const px = ((p.x - startMinute) / visibleMinutes) * 100;
            const py = (1 - (p.y - scheduler.minY) / yRange) * 100;

            if (i === 0) {
                pathD += `M ${px} ${py}`;
                fillD += `M ${px} 100 L ${px} ${py}`;
            } else {
                pathD += ` L ${px} ${py}`;
                fillD += ` L ${px} ${py}`;
            }
        });

        // Close fill area
        if (pathPoints.length > 0) {
            const lastPx = ((pathPoints[pathPoints.length - 1].x - startMinute) / visibleMinutes) * 100;
            fillD += ` L ${lastPx} 100 Z`;
        }

        curvePath.setAttribute('d', pathD);
        fillPath.setAttribute('d', fillD);

        // Render draggable points
        scheduler.points.forEach((point, index) => {
            if (point.x < startMinute || point.x > endMinute) return;

            const px = ((point.x - startMinute) / visibleMinutes) * 100;
            const py = (1 - (point.y - scheduler.minY) / yRange) * 100;

            const el = document.createElement('div');
            el.className = 'point';
            el.style.left = `${px}%`;
            el.style.top = `${py}%`;
            el.dataset.index = index;

            // Add tooltip on hover
            el.addEventListener('mouseenter', (e) => this.showPointTooltip(e, entityId, index));
            el.addEventListener('mouseleave', () => this.hidePointTooltip(entityId));

            graph.appendChild(el);
        });
    }

    /**
     * Render Y-axis labels
     */
    renderYAxis(card, scheduler) {
        const yAxis = card.querySelector('.graph-y-axis');
        const steps = 5;
        const range = scheduler.maxY - scheduler.minY;

        let labels = [];
        for (let i = 0; i <= steps; i++) {
            const value = scheduler.maxY - (range * i / steps);
            labels.push(`<span>${value.toFixed(1)}${scheduler.unit}</span>`);
        }
        yAxis.innerHTML = labels.join('');
    }

    /**
     * Render X-axis labels
     */
    renderXAxis(card, scheduler) {
        const xAxis = card.querySelector('.graph-x-axis');
        const visibleMinutes = 1440 / scheduler.zoomLevel;
        const startMinute = scheduler.zoomOffset;
        const endMinute = startMinute + visibleMinutes;

        // Determine appropriate interval based on zoom level - more granular
        let interval = 360; // 6 hours
        if (scheduler.zoomLevel >= 2) interval = 180;   // 3 hours
        if (scheduler.zoomLevel >= 4) interval = 60;    // 1 hour
        if (scheduler.zoomLevel >= 8) interval = 30;    // 30 min
        if (scheduler.zoomLevel >= 16) interval = 15;   // 15 min
        if (scheduler.zoomLevel >= 32) interval = 10;   // 10 min
        if (scheduler.zoomLevel >= 48) interval = 5;    // 5 min
        if (scheduler.zoomLevel >= 96) interval = 2;    // 2 min

        let labels = [];
        for (let m = Math.ceil(startMinute / interval) * interval; m <= endMinute; m += interval) {
            const percent = ((m - startMinute) / visibleMinutes) * 100;
            const time = minutesToTime(m);
            labels.push(`<span style="position: absolute; left: ${percent}%; transform: translateX(-50%);">${time}</span>`);
        }
        xAxis.innerHTML = labels.join('');
    }

    /**
     * Render grid lines
     */
    renderGrid(card, scheduler) {
        const gridContainer = card.querySelector('.grid-lines');
        const visibleMinutes = 1440 / scheduler.zoomLevel;
        const startMinute = scheduler.zoomOffset;
        const endMinute = startMinute + visibleMinutes;

        // Horizontal grid lines (Y-axis)
        let html = '';
        const ySteps = 5;
        for (let i = 1; i < ySteps; i++) {
            const percent = (i / ySteps) * 100;
            html += `<div class="grid-line-h" style="top: ${percent}%;"></div>`;
        }

        // Vertical grid lines (X-axis) - adaptive based on zoom - more granular
        let majorInterval = 360; // 6 hours
        let minorInterval = 60; // 1 hour

        if (scheduler.zoomLevel >= 2) {
            majorInterval = 180;
            minorInterval = 30;
        }
        if (scheduler.zoomLevel >= 4) {
            majorInterval = 60;
            minorInterval = 15;
        }
        if (scheduler.zoomLevel >= 8) {
            majorInterval = 30;
            minorInterval = 5;
        }
        if (scheduler.zoomLevel >= 16) {
            majorInterval = 15;
            minorInterval = 5;
        }
        if (scheduler.zoomLevel >= 32) {
            majorInterval = 10;
            minorInterval = 2;
        }
        if (scheduler.zoomLevel >= 48) {
            majorInterval = 5;
            minorInterval = 1;
        }

        // Minor grid lines
        for (let m = Math.ceil(startMinute / minorInterval) * minorInterval; m <= endMinute; m += minorInterval) {
            const percent = ((m - startMinute) / visibleMinutes) * 100;
            const isMajor = m % majorInterval === 0;
            html += `<div class="grid-line-v ${isMajor ? 'major' : ''}" style="left: ${percent}%;"></div>`;
        }

        gridContainer.innerHTML = html;
    }

    /**
     * Show tooltip for a point
     */
    showPointTooltip(e, entityId, pointIndex) {
        const scheduler = this.schedulers[entityId];
        const point = scheduler.points[pointIndex];
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        const graph = card.querySelector('[data-graph]');

        // Remove existing tooltip
        this.hidePointTooltip(entityId);

        const tooltip = document.createElement('div');
        tooltip.className = 'point-tooltip';
        tooltip.innerHTML = `
            <span class="time">${minutesToTime(point.x)}</span>
            <span class="value">${point.y.toFixed(1)}${scheduler.unit}</span>
        `;

        const pointEl = e.target;
        tooltip.style.left = pointEl.style.left;
        tooltip.style.top = pointEl.style.top;

        // Determine if tooltip should be above or below based on Y position
        const yPercent = parseFloat(pointEl.style.top);
        if (yPercent < 20) {
            tooltip.classList.add('below');
        } else {
            tooltip.classList.add('above');
        }

        graph.appendChild(tooltip);
    }

    /**
     * Hide point tooltip
     */
    hidePointTooltip(entityId) {
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        if (card) {
            card.querySelectorAll('.point-tooltip').forEach(el => el.remove());
        }
    }

    /**
     * Handle mouse down on graph
     */
    handleGraphMouseDown(e, entityId) {
        // Don't create points if clicking on the controls menu
        if (e.target.closest('.graph-controls-menu')) {
            return;
        }

        const scheduler = this.schedulers[entityId];
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        const graph = card.querySelector('[data-graph]');
        const rect = graph.getBoundingClientRect();

        const visibleMinutes = 1440 / scheduler.zoomLevel;
        const startMinute = scheduler.zoomOffset;
        const yRange = scheduler.maxY - scheduler.minY;

        // Get entity info for Y-axis clamping
        const entityInfo = this.panel.getEntityInfo(scheduler.entityId);
        const entityMinY = entityInfo.minY;
        const entityMaxY = entityInfo.maxY;

        // Middle mouse button - pan the graph (X only; Y panning disabled)
        if (e.button === 1) {
            e.preventDefault();
            let lastX = e.clientX;
            let lastY = e.clientY;

            const onMove = (ev) => {
                const deltaX = lastX - ev.clientX;
                const deltaY = ev.clientY - lastY;

                // X-axis panning (only if zoomed in)
                if (scheduler.zoomLevel > 1) {
                    const minutesPerPixel = visibleMinutes / rect.width;
                    const panDelta = deltaX * minutesPerPixel;
                    scheduler.zoomOffset = Math.max(0, Math.min(1440 - visibleMinutes, scheduler.zoomOffset + panDelta));
                }

                // Y-axis panning is intentionally disabled to keep bounds fixed

                lastX = ev.clientX;
                lastY = ev.clientY;
                this.panel.updateSchedulerCard(entityId);
            };

            const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
            return;
        }

        // Left click only for points/panning
        if (e.button !== 0) return;

        const getCoords = (ev) => {
            let xRatio = (ev.clientX - rect.left) / rect.width;
            let yRatio = 1 - (ev.clientY - rect.top) / rect.height;

            let x = startMinute + xRatio * visibleMinutes;
            let y = scheduler.minY + yRatio * yRange;

            // Apply X snapping
            const snap = scheduler.snapMinutes !== null ? scheduler.snapMinutes : this.globalSnapMinutes;
            if (snap > 0) {
                x = Math.round(x / snap) * snap;
            }

            // Apply Y snapping
            const ySnap = scheduler.ySnap || 0;
            if (ySnap > 0) {
                y = Math.round(y / ySnap) * ySnap;
            }

            x = Math.max(0, Math.min(1440, x));
            // Clamp Y to entity limits
            y = Math.max(entityMinY, Math.min(entityMaxY, y));

            return { x, y };
        };

        if (e.target.classList.contains('point')) {
            // Drag existing point
            const index = parseInt(e.target.dataset.index);
            e.target.classList.add('dragging');

            // Save undo state before modifying
            this.panel.saveUndoState(entityId);

            // Hide hover effects while dragging
            card.querySelectorAll('.curve-tooltip, .hover-line, .hover-dot').forEach(el => el.remove());

            const onMove = (ev) => {
                const coords = getCoords(ev);

                // Prevent dragging to same X as another point
                const hasConflict = scheduler.points.some((p, i) =>
                    i !== index && Math.abs(p.x - coords.x) < 1
                );
                if (!hasConflict) {
                    scheduler.points[index] = coords;
                    this.renderGraph(entityId);
                    this.panel.updateCurrentValue(entityId);
                    this.showPointTooltip({ target: graph.querySelector(`[data-index="${index}"]`) }, entityId, index);
                }
            };

            const onUp = () => {
                e.target.classList.remove('dragging');
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
                this.hidePointTooltip(entityId);
            };

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        } else {
            // Left click on graph area - determine if panning or adding point
            const startX = e.clientX;
            const startY = e.clientY;
            const startTime = Date.now();
            let hasMoved = false;
            let lastX = e.clientX;
            let lastY = e.clientY;

            const onMove = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // If moved more than 5 pixels, consider it a pan
                if (distance > 5) {
                    hasMoved = true;

                    // X-axis panning (only if zoomed)
                    if (scheduler.zoomLevel > 1) {
                        const deltaX = lastX - ev.clientX;
                        const minutesPerPixel = visibleMinutes / rect.width;
                        const panDelta = deltaX * minutesPerPixel;
                        scheduler.zoomOffset = Math.max(0, Math.min(1440 - visibleMinutes, scheduler.zoomOffset + panDelta));
                    }

                    // Y-axis panning is intentionally disabled to keep bounds fixed

                    lastX = ev.clientX;
                    lastY = ev.clientY;
                    this.panel.updateSchedulerCard(entityId);
                }
            };

            const onUp = (ev) => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);

                const elapsed = Date.now() - startTime;

                // If click was short (< 200ms) and didn't move, add a point
                if (!hasMoved && elapsed < 200) {
                    // Save undo state before adding point
                    this.panel.saveUndoState(entityId);

                    const coords = getCoords(ev);

                    // Check if a point already exists at this X position
                    const existingPointIndex = scheduler.points.findIndex(p => Math.abs(p.x - coords.x) < 1);

                    if (existingPointIndex !== -1) {
                        scheduler.points[existingPointIndex].y = coords.y;
                    } else {
                        scheduler.points.push(coords);
                    }
                    this.renderGraph(entityId);
                    this.panel.updateCurrentValue(entityId);
                }
            };

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
    }

    /**
     * Handle double click on graph (delete point)
     */
    handleGraphDoubleClick(e, entityId) {
        if (e.target.classList.contains('point')) {
            const index = parseInt(e.target.dataset.index);
            const scheduler = this.schedulers[entityId];

            // Don't delete if only 2 points remain
            if (scheduler.points.length <= 2) {
                alert('Cannot delete: minimum 2 points required');
                return;
            }

            // Save undo state before deleting
            this.panel.saveUndoState(entityId);

            scheduler.points.splice(index, 1);
            this.renderGraph(entityId);
        }
    }

    /**
     * Handle mouse move on graph (hover tooltip)
     */
    handleGraphMouseMove(e, entityId) {
        // Don't show hover tooltip if dragging a point or hovering over a point
        if (e.target.classList.contains('point') || e.buttons !== 0) {
            // If hovering over a point, hide the line hover effects
            const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
            if (card) {
                card.querySelectorAll('.curve-tooltip, .hover-line, .hover-dot').forEach(el => el.remove());
            }
            return;
        }

        const scheduler = this.schedulers[entityId];
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        const graph = card.querySelector('[data-graph]');
        const rect = graph.getBoundingClientRect();

        const visibleMinutes = 1440 / scheduler.zoomLevel;
        const startMinute = scheduler.zoomOffset;
        const yRange = scheduler.maxY - scheduler.minY;

        // Calculate x position in minutes
        const xRatio = (e.clientX - rect.left) / rect.width;
        const xMinutes = startMinute + xRatio * visibleMinutes;

        // Get interpolated Y value at this position
        const yValue = interpolateValue(xMinutes, scheduler.points, scheduler.mode, scheduler.minY, scheduler.maxY);

        // Calculate positions for tooltip and dot
        const xPercent = xRatio * 100;
        const yPercent = (1 - (yValue - scheduler.minY) / yRange) * 100;

        // Remove existing hover elements
        card.querySelectorAll('.curve-tooltip, .hover-line, .hover-dot').forEach(el => el.remove());

        // Create hover line
        const hoverLine = document.createElement('div');
        hoverLine.className = 'hover-line';
        hoverLine.style.left = `${xPercent}%`;
        graph.appendChild(hoverLine);

        // Create hover dot on the curve
        const hoverDot = document.createElement('div');
        hoverDot.className = 'hover-dot';
        hoverDot.style.left = `${xPercent}%`;
        hoverDot.style.top = `${yPercent}%`;
        graph.appendChild(hoverDot);

        // Create tooltip - position above or below depending on space
        const tooltip = document.createElement('div');
        tooltip.className = 'curve-tooltip';
        tooltip.innerHTML = `
            <span class="time">${minutesToTime(Math.round(xMinutes))}</span>
            <span class="value">${yValue.toFixed(1)}${scheduler.unit}</span>
        `;
        tooltip.style.left = `${xPercent}%`;
        tooltip.style.top = `${yPercent}%`;

        // Determine if tooltip should be above or below
        if (yPercent < 20) {
            tooltip.classList.add('below');
        } else {
            tooltip.classList.add('above');
        }

        graph.appendChild(tooltip);
    }

    /**
     * Handle mouse leave on graph
     */
    handleGraphMouseLeave(e, entityId) {
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        if (card) {
            card.querySelectorAll('.curve-tooltip, .hover-line, .hover-dot').forEach(el => el.remove());
        }
    }

    /**
     * Handle wheel zoom on graph
     */
    handleGraphWheel(e, entityId) {
        e.preventDefault();
        e.stopPropagation();

        const s = this.schedulers[entityId];
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        const graph = card.querySelector('[data-graph]');
        const rect = graph.getBoundingClientRect();

        // Calculate the time position under the mouse cursor
        const xRatio = (e.clientX - rect.left) / rect.width;
        const visibleMinutes = 1440 / s.zoomLevel;
        const mouseMinute = s.zoomOffset + xRatio * visibleMinutes;

        if (e.deltaY < 0 && s.zoomLevel < 96) { // Allow zoom up to 15 minutes visible
            // Zoom in (1.25x for smoother zoom)
            s.zoomLevel = Math.min(96, s.zoomLevel * 1.25);
            // Adjust offset to keep mouse position centered
            const newVisibleMinutes = 1440 / s.zoomLevel;
            s.zoomOffset = Math.max(0, Math.min(1440 - newVisibleMinutes, mouseMinute - xRatio * newVisibleMinutes));
            this.panel.updateSchedulerCard(entityId);
        } else if (e.deltaY > 0 && s.zoomLevel > 1) {
            // Zoom out (1.25x for smoother zoom)
            s.zoomLevel = Math.max(1, s.zoomLevel / 1.25);
            const newVisibleMinutes = 1440 / s.zoomLevel;
            s.zoomOffset = Math.max(0, Math.min(1440 - newVisibleMinutes, mouseMinute - xRatio * newVisibleMinutes));
            this.panel.updateSchedulerCard(entityId);
        } else if (e.shiftKey && s.zoomLevel > 1) {
            // Shift+scroll for panning
            const panDelta = (e.deltaY > 0 ? 1 : -1) * (visibleMinutes / 4);
            s.zoomOffset = Math.max(0, Math.min(1440 - visibleMinutes, s.zoomOffset + panDelta));
            this.panel.updateSchedulerCard(entityId);
        }
    }

    /**
     * Setup touch handlers for zoom and pan
     */
    setupTouchHandlers(graph, entityId) {
        let lastTouchX = 0;
        let lastTouchDistance = 0;
        let isPanning = false;

        graph.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // Single touch - start pan
                lastTouchX = e.touches[0].clientX;
                isPanning = true;
            } else if (e.touches.length === 2) {
                // Two fingers - start pinch zoom
                isPanning = false;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: true });

        graph.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const s = this.schedulers[entityId];

            if (e.touches.length === 1 && isPanning && s.zoomLevel > 1) {
                // Pan
                const rect = graph.getBoundingClientRect();
                const deltaX = lastTouchX - e.touches[0].clientX;
                const minutesPerPixel = (1440 / s.zoomLevel) / rect.width;
                const panDelta = deltaX * minutesPerPixel;

                s.zoomOffset = Math.max(0, Math.min(1440 - 1440 / s.zoomLevel, s.zoomOffset + panDelta));
                lastTouchX = e.touches[0].clientX;
                this.panel.updateSchedulerCard(entityId);
            } else if (e.touches.length === 2) {
                // Pinch zoom
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastTouchDistance > 0) {
                    const scale = distance / lastTouchDistance;
                    if (scale > 1.1 && s.zoomLevel < 96) { // Allow zoom up to 15 minutes visible
                        s.zoomLevel *= 2;
                        this.panel.updateSchedulerCard(entityId);
                    } else if (scale < 0.9 && s.zoomLevel > 1) {
                        s.zoomLevel /= 2;
                        s.zoomOffset = Math.max(0, Math.min(s.zoomOffset, 1440 - 1440 / s.zoomLevel));
                        this.panel.updateSchedulerCard(entityId);
                    }
                }
                lastTouchDistance = distance;
            }
        }, { passive: false });

        graph.addEventListener('touchend', () => {
            isPanning = false;
            lastTouchDistance = 0;
        }, { passive: true });
    }

    /**
     * Update current time marker position
     */
    updateCurrentTimeMarker(entityId) {
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        if (!card) return;

        const scheduler = this.schedulers[entityId];
        const marker = card.querySelector('[data-time-marker]');

        // Get current time in minutes
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Calculate position
        const visibleMinutes = 1440 / scheduler.zoomLevel;
        const startMinute = scheduler.zoomOffset;
        const endMinute = startMinute + visibleMinutes;

        // Check if current time is in visible range
        if (currentMinutes >= startMinute && currentMinutes <= endMinute) {
            const xPercent = ((currentMinutes - startMinute) / visibleMinutes) * 100;
            marker.style.left = `${xPercent}%`;
            marker.style.display = 'block';
        } else {
            marker.style.display = 'none';
        }
    }

    /**
     * Update current value display - shows actual entity value vs scheduled value
     */
    updateCurrentValue(entityId) {
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        if (!card) return;

        const scheduler = this.schedulers[entityId];
        const actualValueDisplay = card.querySelector('[data-actual-value]');
        const scheduledValueDisplay = card.querySelector('[data-scheduled-value]');
        const nextValueDisplay = card.querySelector('[data-next-value]');

        // Get current time in minutes
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Get actual entity value from Home Assistant (state or selected numeric attribute)
        const entityState = this.panel._hass?.states[scheduler.entityId];
        let actualValue = '--';
        if (entityState) {
            const attrs = entityState.attributes || {};
            if (scheduler.attribute && typeof attrs[scheduler.attribute] === 'number') {
                actualValue = `${attrs[scheduler.attribute]}${scheduler.unit}`;
            } else {
                const domain = scheduler.entityId.split('.')[0];
                switch (domain) {
                    case 'light':
                        const brightness = attrs?.brightness;
                        actualValue = brightness !== undefined
                            ? `${Math.round((brightness / 255) * 100)}%`
                            : (entityState.state === 'on' ? '100%' : '0%');
                        break;
                    case 'climate':
                        actualValue = `${attrs?.current_temperature ?? attrs?.temperature ?? '--'}${scheduler.unit}`;
                        break;
                    case 'fan':
                        actualValue = `${attrs?.percentage ?? (entityState.state === 'on' ? 100 : 0)}%`;
                        break;
                    case 'cover':
                        actualValue = `${attrs?.current_position ?? '--'}%`;
                        break;
                    case 'humidifier':
                        actualValue = `${attrs?.humidity ?? '--'}%`;
                        break;
                    case 'media_player':
                        const vol = attrs?.volume_level;
                        actualValue = vol !== undefined ? `${Math.round(vol * 100)}%` : '--';
                        break;
                    default:
                        actualValue = `${parseFloat(entityState.state) || '--'}${scheduler.unit}`;
                }
            }
        }

        // Get interpolated scheduled value at current time
        const scheduledValue = interpolateValue(currentMinutes, scheduler.points, scheduler.mode, scheduler.minY, scheduler.maxY);
        // Next update is driven by the configured interval (even if value remains the same)
        const updateIntervalSec = parseInt(scheduler.updateInterval) || 300;
        const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        // Next execution is the next multiple of the interval >= currentSeconds (inclusive)
        const nextUpdateSeconds = Math.ceil(currentSeconds / updateIntervalSec) * updateIntervalSec;
        const nextUpdateSecondsWrap = nextUpdateSeconds >= 86400 ? nextUpdateSeconds - 86400 : nextUpdateSeconds;
        const nextUpdateMinutes = nextUpdateSecondsWrap / 60;
        const nextValue = interpolateValue(nextUpdateMinutes, scheduler.points, scheduler.mode, scheduler.minY, scheduler.maxY);

        // Format next time - show seconds if interval is less than 60 seconds
        let nextTimeStr;
        if (updateIntervalSec < 60) {
            const h = Math.floor(nextUpdateSecondsWrap / 3600);
            const m = Math.floor((nextUpdateSecondsWrap % 3600) / 60);
            const s = nextUpdateSecondsWrap % 60;
            nextTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
            nextTimeStr = minutesToTime(nextUpdateMinutes);
        }

        // Update displays
        if (actualValueDisplay) {
            actualValueDisplay.textContent = actualValue;
        }
        if (scheduledValueDisplay) {
            scheduledValueDisplay.textContent = `${scheduledValue.toFixed(1)}${scheduler.unit}`;
        }
        if (nextValueDisplay) {
            nextValueDisplay.textContent = `${nextTimeStr}: ${nextValue.toFixed(1)}${scheduler.unit}`;
        }
    }

    /**
     * Render points list for manual editing
     */
    renderPointsList(entityId) {
        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        if (!card) return;

        const scheduler = this.schedulers[entityId];
        const pointsList = card.querySelector('[data-points-list]');
        if (!pointsList) return;

        // Get entity limits for validation
        const entityInfo = this.panel.getEntityInfo(scheduler.entityId);

        let html = '';
        scheduler.points.forEach((point, index) => {
            html += `
                <div class="point-row" data-point-index="${index}">
                    <span class="point-index">#${index + 1}</span>
                    <input type="text" data-point-time value="${minutesToTime(point.x)}" title="Time (HH:MM)" style="width: 70px;">
                    <input type="number" data-point-value value="${point.y.toFixed(2)}"
                           min="${entityInfo.minY}" max="${entityInfo.maxY}"
                           step="${scheduler.ySnap || 0.1}" title="Value" style="width: 80px;">
                    <button class="point-delete" data-action="deletePoint" ${scheduler.points.length <= 2 ? 'disabled' : ''}>
                        <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                </div>
            `;
        });

        pointsList.innerHTML = html;

        // Update header count
        const header = card.querySelector('.points-editor-header span');
        if (header) {
            header.textContent = `Edit Points (${scheduler.points.length})`;
        }
    }

    // ============ Multi-Graph Methods ============

    /**
     * Render a specific graph section (multi-graph support)
     */
    renderGraphSection(entityId, graphIndex, section) {
        const scheduler = this.schedulers[entityId];
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;
        const graph = scheduler.graphs[graphIndex];
        if (!graph || !section) return;

        const graphContainer = section.querySelector('[data-graph]');
        const svg = graphContainer?.querySelector('.curve-svg');
        if (!graphContainer || !svg) return;

        const curvePath = svg.querySelector('.curve-line');
        const fillPath = svg.querySelector('.fill-area');

        // Clear existing points
        graphContainer.querySelectorAll('.point, .point-tooltip').forEach(el => el.remove());

        // Sort points by x
        graph.points.sort((a, b) => a.x - b.x);

        // Calculate visible range
        const zoomLevel = graph.zoomLevel || 1;
        const zoomOffset = graph.zoomOffset || 0;
        const visibleMinutes = 1440 / zoomLevel;
        const startMinute = zoomOffset;
        const endMinute = startMinute + visibleMinutes;
        const yRange = graph.maxY - graph.minY;

        // Generate interpolated path using graph's points
        const pathPoints = generateInterpolatedPath({
            points: graph.points,
            mode: graph.mode,
            minY: graph.minY,
            maxY: graph.maxY,
            stepToZero: graph.stepToZero
        }, startMinute, endMinute);

        // Use viewBox coordinates (0-100 for both axes)
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');

        let pathD = '';
        let fillD = '';

        pathPoints.forEach((p, i) => {
            const px = ((p.x - startMinute) / visibleMinutes) * 100;
            const py = (1 - (p.y - graph.minY) / yRange) * 100;

            if (i === 0) {
                pathD += `M ${px} ${py}`;
                fillD += `M ${px} 100 L ${px} ${py}`;
            } else {
                pathD += ` L ${px} ${py}`;
                fillD += ` L ${px} ${py}`;
            }
        });

        // Close fill area
        if (pathPoints.length > 0) {
            const lastPx = ((pathPoints[pathPoints.length - 1].x - startMinute) / visibleMinutes) * 100;
            fillD += ` L ${lastPx} 100 Z`;
        }

        curvePath.setAttribute('d', pathD);
        fillPath.setAttribute('d', fillD);

        // Render draggable points
        graph.points.forEach((point, index) => {
            if (point.x < startMinute || point.x > endMinute) return;

            const px = ((point.x - startMinute) / visibleMinutes) * 100;
            const py = (1 - (point.y - graph.minY) / yRange) * 100;

            const el = document.createElement('div');
            el.className = 'point';
            el.style.left = `${px}%`;
            el.style.top = `${py}%`;
            el.dataset.index = index;

            // Add tooltip on hover
            el.addEventListener('mouseenter', (e) => this.showPointTooltipMulti(e, entityId, graphIndex, index));
            el.addEventListener('mouseleave', () => this.hidePointTooltipMulti(section));

            graphContainer.appendChild(el);
        });
    }

    /**
     * Render Y-axis for a graph section (multi-graph)
     */
    renderYAxisMulti(section, graph) {
        const yAxis = section.querySelector('.graph-y-axis');
        if (!yAxis) return;

        const steps = 5;
        const range = graph.maxY - graph.minY;
        const unit = graph.unit || '';

        let labels = [];
        for (let i = 0; i <= steps; i++) {
            const value = graph.maxY - (range * i / steps);
            labels.push(`<span>${value.toFixed(1)}${unit}</span>`);
        }
        yAxis.innerHTML = labels.join('');
    }

    /**
     * Render X-axis for a graph section (multi-graph)
     */
    renderXAxisMulti(section, graph) {
        const xAxis = section.querySelector('.graph-x-axis');
        if (!xAxis) return;

        const zoomLevel = graph.zoomLevel || 1;
        const zoomOffset = graph.zoomOffset || 0;
        const visibleMinutes = 1440 / zoomLevel;
        const startMinute = zoomOffset;
        const endMinute = startMinute + visibleMinutes;

        // Determine appropriate interval based on zoom level
        let interval = 360;
        if (zoomLevel >= 2) interval = 180;
        if (zoomLevel >= 4) interval = 60;
        if (zoomLevel >= 8) interval = 30;
        if (zoomLevel >= 16) interval = 15;
        if (zoomLevel >= 32) interval = 10;
        if (zoomLevel >= 48) interval = 5;
        if (zoomLevel >= 96) interval = 2;

        let labels = [];
        for (let m = Math.ceil(startMinute / interval) * interval; m <= endMinute; m += interval) {
            const percent = ((m - startMinute) / visibleMinutes) * 100;
            const time = minutesToTime(m);
            labels.push(`<span style="position: absolute; left: ${percent}%; transform: translateX(-50%);">${time}</span>`);
        }
        xAxis.innerHTML = labels.join('');
    }

    /**
     * Render grid for a graph section (multi-graph)
     */
    renderGridMulti(section, graph) {
        const gridContainer = section.querySelector('.grid-lines');
        if (!gridContainer) return;

        const zoomLevel = graph.zoomLevel || 1;
        const zoomOffset = graph.zoomOffset || 0;
        const visibleMinutes = 1440 / zoomLevel;
        const startMinute = zoomOffset;
        const endMinute = startMinute + visibleMinutes;

        // Horizontal grid lines (Y-axis)
        let html = '';
        const ySteps = 5;
        for (let i = 1; i < ySteps; i++) {
            const percent = (i / ySteps) * 100;
            html += `<div class="grid-line-h" style="top: ${percent}%;"></div>`;
        }

        // Vertical grid lines (X-axis)
        let majorInterval = 360;
        let minorInterval = 60;

        if (zoomLevel >= 2) { majorInterval = 180; minorInterval = 30; }
        if (zoomLevel >= 4) { majorInterval = 60; minorInterval = 15; }
        if (zoomLevel >= 8) { majorInterval = 30; minorInterval = 5; }
        if (zoomLevel >= 16) { majorInterval = 15; minorInterval = 5; }
        if (zoomLevel >= 32) { majorInterval = 10; minorInterval = 2; }
        if (zoomLevel >= 48) { majorInterval = 5; minorInterval = 1; }

        for (let m = Math.ceil(startMinute / minorInterval) * minorInterval; m <= endMinute; m += minorInterval) {
            const percent = ((m - startMinute) / visibleMinutes) * 100;
            const isMajor = m % majorInterval === 0;
            html += `<div class="grid-line-v ${isMajor ? 'major' : ''}" style="left: ${percent}%;"></div>`;
        }

        gridContainer.innerHTML = html;
    }

    /**
     * Update current time marker for a graph section (multi-graph)
     */
    updateCurrentTimeMarkerMulti(section, graph) {
        const marker = section.querySelector('[data-time-marker]');
        if (!marker) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const zoomLevel = graph.zoomLevel || 1;
        const zoomOffset = graph.zoomOffset || 0;
        const visibleMinutes = 1440 / zoomLevel;
        const startMinute = zoomOffset;
        const endMinute = startMinute + visibleMinutes;

        if (currentMinutes >= startMinute && currentMinutes <= endMinute) {
            const xPercent = ((currentMinutes - startMinute) / visibleMinutes) * 100;
            marker.style.left = `${xPercent}%`;
            marker.style.display = 'block';
        } else {
            marker.style.display = 'none';
        }
    }

    /**
     * Update current value display for a graph section (multi-graph)
     */
    updateCurrentValueMulti(entityId, graphIndex, section) {
        const scheduler = this.schedulers[entityId];
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;
        const graph = scheduler.graphs[graphIndex];
        if (!graph) return;

        const actualValueDisplay = section.querySelector('[data-actual-value]');
        const scheduledValueDisplay = section.querySelector('[data-scheduled-value]');
        const nextValueDisplay = section.querySelector('[data-next-value]');

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const unit = graph.unit || '';

        // Get actual entity value from Home Assistant
        const entityState = this.panel._hass?.states[scheduler.entityId];
        let actualValue = '--';
        if (entityState) {
            const attrs = entityState.attributes || {};
            if (graph.attribute && typeof attrs[graph.attribute] === 'number') {
                actualValue = `${attrs[graph.attribute]}${unit}`;
            } else {
                const domain = scheduler.entityId.split('.')[0];
                switch (domain) {
                    case 'light':
                        const brightness = attrs?.brightness;
                        actualValue = brightness !== undefined
                            ? `${Math.round((brightness / 255) * 100)}%`
                            : (entityState.state === 'on' ? '100%' : '0%');
                        break;
                    case 'climate':
                        actualValue = `${attrs?.current_temperature ?? attrs?.temperature ?? '--'}${unit}`;
                        break;
                    case 'fan':
                        actualValue = `${attrs?.percentage ?? (entityState.state === 'on' ? 100 : 0)}%`;
                        break;
                    case 'cover':
                        actualValue = `${attrs?.current_position ?? '--'}%`;
                        break;
                    default:
                        actualValue = `${parseFloat(entityState.state) || '--'}${unit}`;
                }
            }
        }

        // Get interpolated scheduled value at current time
        const scheduledValue = interpolateValue(currentMinutes, graph.points, graph.mode, graph.minY, graph.maxY);

        // Next change calculation - find next time where value is DIFFERENT from current
        const updateIntervalSec = parseInt(scheduler.updateInterval) || 300;
        const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const weekdays = graph.weekdays || [0, 1, 2, 3, 4, 5, 6];
        const currentWeekday = now.getDay(); // 0 = Sunday
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Find next update where value differs from scheduled value
        let nextValue = null;
        let nextTimeStr = '--';
        let daysAhead = 0;
        const maxIterations = 7 * 24 * 60 * 60 / updateIntervalSec; // Max 1 week of intervals

        for (let i = 0; i < maxIterations; i++) {
            const checkSeconds = Math.ceil(currentSeconds / updateIntervalSec) * updateIntervalSec + (i * updateIntervalSec);
            daysAhead = Math.floor(checkSeconds / 86400);
            const checkSecondsInDay = checkSeconds % 86400;
            const checkMinutes = checkSecondsInDay / 60;
            const checkWeekday = (currentWeekday + daysAhead) % 7;

            // Skip if this weekday is not enabled
            if (!weekdays.includes(checkWeekday)) {
                continue;
            }

            const checkValue = interpolateValue(checkMinutes, graph.points, graph.mode, graph.minY, graph.maxY);

            // Check if value is different (using small tolerance for floating point)
            if (Math.abs(checkValue - scheduledValue) > 0.05) {
                nextValue = checkValue;

                // Format time string
                if (updateIntervalSec < 60) {
                    const h = Math.floor(checkSecondsInDay / 3600);
                    const m = Math.floor((checkSecondsInDay % 3600) / 60);
                    const s = checkSecondsInDay % 60;
                    nextTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                } else {
                    nextTimeStr = minutesToTime(checkMinutes);
                }

                // Add day name if it's not today or if today's weekday is disabled
                if (daysAhead > 0 || !weekdays.includes(currentWeekday)) {
                    nextTimeStr = `${dayNames[checkWeekday]} ${nextTimeStr}`;
                }
                break;
            }
        }

        if (actualValueDisplay) actualValueDisplay.textContent = actualValue;
        if (scheduledValueDisplay) scheduledValueDisplay.textContent = `${scheduledValue.toFixed(1)}${unit}`;
        if (nextValueDisplay) {
            if (nextValue !== null) {
                nextValueDisplay.textContent = `${nextTimeStr}: ${nextValue.toFixed(1)}${unit}`;
            } else {
                nextValueDisplay.textContent = 'No change';
            }
        }
    }

    /**
     * Show tooltip for a point in multi-graph mode
     */
    showPointTooltipMulti(e, entityId, graphIndex, pointIndex) {
        const scheduler = this.schedulers[entityId];
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;
        const graph = scheduler.graphs[graphIndex];
        if (!graph || !Array.isArray(graph.points)) return;
        const point = graph.points[pointIndex];
        if (!point) return;
        const unit = graph.unit || '';

        const card = this.panel._root.querySelector(`[data-entity="${entityId}"]`);
        const section = card.querySelector(`[data-graph-index="${graphIndex}"]`);
        const graphContainer = section.querySelector('[data-graph]');

        // Remove existing tooltip
        this.hidePointTooltipMulti(section);

        const tooltip = document.createElement('div');
        tooltip.className = 'point-tooltip';
        tooltip.innerHTML = `
            <span class="time">${minutesToTime(point.x)}</span>
            <span class="value">${point.y.toFixed(1)}${unit}</span>
        `;

        const pointEl = e.target;
        tooltip.style.left = pointEl.style.left;
        tooltip.style.top = pointEl.style.top;

        const yPercent = parseFloat(pointEl.style.top);
        tooltip.classList.add(yPercent < 20 ? 'below' : 'above');

        graphContainer.appendChild(tooltip);
    }

    /**
     * Hide point tooltip in multi-graph mode
     */
    hidePointTooltipMulti(section) {
        if (section) {
            section.querySelectorAll('.point-tooltip').forEach(el => el.remove());
        }
    }

    /**
     * Render points list for multi-graph mode
     */
    renderPointsListMulti(entityId, graphIndex, section) {
        const scheduler = this.schedulers[entityId];
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;
        const graph = scheduler.graphs[graphIndex];
        if (!graph) return;

        const pointsList = section.querySelector('[data-points-list]');
        if (!pointsList) return;

        let html = '';
        graph.points.forEach((point, index) => {
            html += `
                <div class="point-row" data-point-index="${index}">
                    <span class="point-index">#${index + 1}</span>
                    <input type="text" data-point-time value="${minutesToTime(point.x)}" title="Time (HH:MM)" style="width: 70px;">
                    <input type="number" data-point-value value="${point.y.toFixed(2)}"
                           min="${graph.minY}" max="${graph.maxY}"
                           step="${graph.ySnap || 0.1}" title="Value" style="width: 80px;">
                    <button class="point-delete" data-action="deletePoint" ${graph.points.length <= 2 ? 'disabled' : ''}>
                        <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                </div>
            `;
        });

        pointsList.innerHTML = html;

        // Update header count
        const header = section.querySelector('.points-editor-header span');
        if (header) {
            header.textContent = `Edit Points (${graph.points.length})`;
        }
    }

    /**
     * Handle mouse down on graph for multi-graph mode
     */
    handleGraphMouseDownMulti(e, entityId, graphIndex, section) {
        if (e.target.closest('.graph-controls-menu')) return;

        const scheduler = this.schedulers[entityId];
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;
        const graph = scheduler.graphs[graphIndex];
        if (!graph) return;
        const graphContainer = section.querySelector('[data-graph]');
        if (!graphContainer) return;
        const rect = graphContainer.getBoundingClientRect();

        const zoomLevel = graph.zoomLevel || 1;
        const zoomOffset = graph.zoomOffset || 0;
        const visibleMinutes = 1440 / zoomLevel;
        const startMinute = zoomOffset;
        const yRange = graph.maxY - graph.minY;

        // Per-graph xSnap: use graph value if explicitly set (even if 0=off), otherwise fallback to global
        const xSnap = graph.xSnap !== undefined ? graph.xSnap : this.globalSnapMinutes;
        const ySnap = graph.ySnap || 0;

        const getCoords = (ev) => {
            let xRatio = (ev.clientX - rect.left) / rect.width;
            let yRatio = 1 - (ev.clientY - rect.top) / rect.height;

            let x = startMinute + xRatio * visibleMinutes;
            let y = graph.minY + yRatio * yRange;

            if (xSnap > 0) x = Math.round(x / xSnap) * xSnap;
            if (ySnap > 0) y = Math.round(y / ySnap) * ySnap;

            x = Math.max(0, Math.min(1440, x));
            y = Math.max(graph.minY, Math.min(graph.maxY, y));

            return { x, y };
        };

        // Middle mouse button - pan (X only; Y panning disabled)
        if (e.button === 1) {
            e.preventDefault();
            let lastX = e.clientX;
            let lastY = e.clientY;

            // Get entity bounds for Y clamping
            const entityInfo = this.panel.getEntityInfo(scheduler.entityId);
            const entityMinY = entityInfo.minY;
            const entityMaxY = entityInfo.maxY;

            const onMove = (ev) => {
                const deltaX = lastX - ev.clientX;
                const deltaY = ev.clientY - lastY;

                if (zoomLevel > 1) {
                    const minutesPerPixel = visibleMinutes / rect.width;
                    graph.zoomOffset = Math.max(0, Math.min(1440 - visibleMinutes, (graph.zoomOffset || 0) + deltaX * minutesPerPixel));
                }

                // Y-axis panning is intentionally disabled to keep bounds fixed

                lastX = ev.clientX;
                lastY = ev.clientY;
                this.panel.updateGraphSection(entityId, graphIndex, section);
            };

            const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
            return;
        }

        if (e.button !== 0) return;

        if (e.target.classList.contains('point')) {
            // Drag existing point
            const index = parseInt(e.target.dataset.index);
            e.target.classList.add('dragging');
            this.panel.saveUndoState(entityId);

            section.querySelectorAll('.curve-tooltip, .hover-line, .hover-dot').forEach(el => el.remove());

            const onMove = (ev) => {
                const coords = getCoords(ev);
                const hasConflict = graph.points.some((p, i) => i !== index && Math.abs(p.x - coords.x) < 1);
                if (!hasConflict) {
                    graph.points[index] = coords;
                    this.renderGraphSection(entityId, graphIndex, section);
                    this.updateCurrentValueMulti(entityId, graphIndex, section);
                    this.showPointTooltipMulti({ target: graphContainer.querySelector(`[data-index="${index}"]`) }, entityId, graphIndex, index);
                }
            };

            const onUp = () => {
                e.target.classList.remove('dragging');
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
                this.hidePointTooltipMulti(section);
            };

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        } else {
            // Click on graph area
            const startX = e.clientX;
            const startY = e.clientY;
            const startTime = Date.now();
            let hasMoved = false;
            let lastX = e.clientX;
            let lastY = e.clientY;

            const onMove = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                if (Math.sqrt(dx * dx + dy * dy) > 5) {
                    hasMoved = true;

                    if (zoomLevel > 1) {
                        const deltaX = lastX - ev.clientX;
                        const minutesPerPixel = visibleMinutes / rect.width;
                        graph.zoomOffset = Math.max(0, Math.min(1440 - visibleMinutes, (graph.zoomOffset || 0) + deltaX * minutesPerPixel));
                    }

                    // Y-axis panning is intentionally disabled to keep bounds fixed

                    lastX = ev.clientX;
                    lastY = ev.clientY;
                    this.panel.updateGraphSection(entityId, graphIndex, section);
                }
            };

            const onUp = (ev) => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);

                if (!hasMoved && Date.now() - startTime < 200) {
                    this.panel.saveUndoState(entityId);
                    const coords = getCoords(ev);
                    const existingIndex = graph.points.findIndex(p => Math.abs(p.x - coords.x) < 1);

                    if (existingIndex !== -1) {
                        graph.points[existingIndex].y = coords.y;
                    } else {
                        graph.points.push(coords);
                    }
                    this.renderGraphSection(entityId, graphIndex, section);
                    this.updateCurrentValueMulti(entityId, graphIndex, section);
                }
            };

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
    }

    /**
     * Handle double click on graph for multi-graph mode
     */
    handleGraphDoubleClickMulti(e, entityId, graphIndex, section) {
        if (e.target.classList.contains('point')) {
            const index = parseInt(e.target.dataset.index);
            const scheduler = this.schedulers[entityId];
            if (!scheduler || !Array.isArray(scheduler.graphs)) return;
            const graph = scheduler.graphs[graphIndex];
            if (!graph) return;

            if (graph.points.length <= 2) {
                alert('Cannot delete: minimum 2 points required');
                return;
            }

            this.panel.saveUndoState(entityId);
            graph.points.splice(index, 1);
            this.renderGraphSection(entityId, graphIndex, section);
        }
    }

    /**
     * Handle wheel zoom for multi-graph mode
     */
    handleGraphWheelMulti(e, entityId, graphIndex, section) {
        e.preventDefault();
        e.stopPropagation();

        const scheduler = this.schedulers[entityId];
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;
        const graph = scheduler.graphs[graphIndex];
        if (!graph) return;
        const graphContainer = section.querySelector('[data-graph]');
        if (!graphContainer) return;
        const rect = graphContainer.getBoundingClientRect();

        const xRatio = (e.clientX - rect.left) / rect.width;
        const zoomLevel = graph.zoomLevel || 1;
        const visibleMinutes = 1440 / zoomLevel;
        const mouseMinute = (graph.zoomOffset || 0) + xRatio * visibleMinutes;

        if (e.deltaY < 0 && zoomLevel < 96) {
            graph.zoomLevel = Math.min(96, zoomLevel * 1.25);
            const newVisibleMinutes = 1440 / graph.zoomLevel;
            graph.zoomOffset = Math.max(0, Math.min(1440 - newVisibleMinutes, mouseMinute - xRatio * newVisibleMinutes));
            this.panel.updateGraphSection(entityId, graphIndex, section);
        } else if (e.deltaY > 0 && zoomLevel > 1) {
            graph.zoomLevel = Math.max(1, zoomLevel / 1.25);
            const newVisibleMinutes = 1440 / graph.zoomLevel;
            graph.zoomOffset = Math.max(0, Math.min(1440 - newVisibleMinutes, mouseMinute - xRatio * newVisibleMinutes));
            this.panel.updateGraphSection(entityId, graphIndex, section);
        } else if (e.shiftKey && zoomLevel > 1) {
            const panDelta = (e.deltaY > 0 ? 1 : -1) * (visibleMinutes / 4);
            graph.zoomOffset = Math.max(0, Math.min(1440 - visibleMinutes, (graph.zoomOffset || 0) + panDelta));
            this.panel.updateGraphSection(entityId, graphIndex, section);
        }
    }

    /**
     * Setup touch handlers for multi-graph mode
     * Supports: point dragging, double-tap to delete, tap to add, swipe to pan, pinch zoom
     */
    setupTouchHandlersMulti(graphContainer, entityId, graphIndex, section) {
        const DOUBLE_TAP_DELETE_MS = 500;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let startTouchX = 0;
        let startTouchY = 0;
        let lastTouchDistance = 0;
        let isPanning = false;
        let isDraggingPoint = false;
        let dragPointIndex = -1;
        let touchStartTime = 0;
        let lastTapTime = 0;
        let lastTapIndex = null;
        let touchedPoint = null;
        let hasMoved = false;
        let ignoreTouch = false;

        const findNearestPoint = (touch) => {
            const points = Array.from(section.querySelectorAll('.point'));
            let best = null;
            let bestDist = Infinity;
            points.forEach((pt) => {
                const rect = pt.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = touch.clientX - cx;
                const dy = touch.clientY - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = pt;
                }
            });
            return bestDist <= 18 ? best : null;
        };

        const showDragTooltip = (coords) => {
            if (!coords) return;
            const scheduler = this.schedulers[entityId];
            const graph = scheduler?.graphs?.[graphIndex];
            if (!graph) return;
            const unit = graph.unit || '';
            this.hidePointTooltipMulti(section);
            const tooltip = document.createElement('div');
            tooltip.className = 'point-tooltip';
            tooltip.innerHTML = `
                <span class="time">${minutesToTime(Math.round(coords.x))}</span>
                <span class="value">${coords.y.toFixed(1)}${unit}</span>
            `;
            const yRange = graph.maxY - graph.minY;
            const xRatio = (coords.x - (graph.zoomOffset || 0)) / (1440 / (graph.zoomLevel || 1));
            const yRatio = 1 - (coords.y - graph.minY) / yRange;
            tooltip.style.left = `${Math.max(0, Math.min(1, xRatio)) * 100}%`;
            tooltip.style.top = `${Math.max(0, Math.min(1, yRatio)) * 100}%`;
            tooltip.classList.add(yRatio * 100 < 20 ? 'below' : 'above');
            graphContainer.appendChild(tooltip);
        };

        // Helper to get coordinates from touch event
        const getTouchCoords = (touch) => {
            const scheduler = this.schedulers[entityId];
            if (!scheduler || !Array.isArray(scheduler.graphs)) return null;
            const graph = scheduler.graphs[graphIndex];
            if (!graph) return null;

            const rect = graphContainer.getBoundingClientRect();
            const zoomLevel = graph.zoomLevel || 1;
            const zoomOffset = graph.zoomOffset || 0;
            const visibleMinutes = 1440 / zoomLevel;
            const startMinute = zoomOffset;
            const yRange = graph.maxY - graph.minY;

            const xSnap = graph.xSnap !== undefined ? graph.xSnap : this.panel.globalSnapMinutes;
            const ySnap = graph.ySnap || 0;

            const xRatio = (touch.clientX - rect.left) / rect.width;
            const yRatio = 1 - (touch.clientY - rect.top) / rect.height;

            let x = startMinute + xRatio * visibleMinutes;
            let y = graph.minY + yRatio * yRange;

            if (xSnap > 0) x = Math.round(x / xSnap) * xSnap;
            if (ySnap > 0) y = Math.round(y / ySnap) * ySnap;

            x = Math.max(0, Math.min(1440, x));
            y = Math.max(graph.minY, Math.min(graph.maxY, y));

            return { x, y };
        };

        graphContainer.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            const pointTarget = target?.classList?.contains('point') ? target : target?.closest?.('.point') || findNearestPoint(touch);
            touchStartTime = Date.now();
            hasMoved = false;
            ignoreTouch = false;

            // Ignore touches that originate on the controls menu
            const path = e.composedPath ? e.composedPath() : [];
            if ((target && target.closest('.graph-controls-menu')) || path.some((el) => el?.classList?.contains?.('graph-controls-menu'))) {
                ignoreTouch = true;
                return;
            }

            if (ignoreTouch) {
                return;
            }

            if (e.touches.length === 1) {
                startTouchX = touch.clientX;
                startTouchY = touch.clientY;
                lastTouchX = touch.clientX;
                lastTouchY = touch.clientY;

                // Check if touching a point
                if (pointTarget) {
                    e.preventDefault(); // Prevent scrolling when touching a point
                    const index = parseInt(pointTarget.dataset.index);
                    touchedPoint = pointTarget;
                    dragPointIndex = index;
                    // Don't set isDraggingPoint yet - wait for movement
                } else {
                    // Touch on graph area
                    touchedPoint = null;
                    dragPointIndex = -1;
                    lastTapIndex = null;
                }
            } else if (e.touches.length === 2) {
                // Two fingers - start pinch zoom
                e.preventDefault();
                isPanning = false;
                isDraggingPoint = false;
                touchedPoint = null;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: false });

        graphContainer.addEventListener('touchmove', (e) => {
            const scheduler = this.schedulers[entityId];
            if (!scheduler || !Array.isArray(scheduler.graphs)) return;
            const graph = scheduler.graphs[graphIndex];
            if (!graph) return;

            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const dx = touch.clientX - startTouchX;
                const dy = touch.clientY - startTouchY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Check if we've moved enough to consider it a drag/pan
                if (distance > 10) {
                    hasMoved = true;

                    if (touchedPoint && dragPointIndex >= 0) {
                        // Started on a point - drag it
                        e.preventDefault();
                        if (!isDraggingPoint) {
                            isDraggingPoint = true;
                            touchedPoint.classList.add('dragging');
                            this.panel.saveUndoState(entityId);
                        }
                        const coords = getTouchCoords(touch);
                        if (coords) {
                            const hasConflict = graph.points.some((p, i) => i !== dragPointIndex && Math.abs(p.x - coords.x) < 1);
                            if (!hasConflict) {
                                graph.points[dragPointIndex] = coords;

                                // Move the point visually without full rerender to keep touch contact
                                const rect = graphContainer.getBoundingClientRect();
                                const zoomLevel = graph.zoomLevel || 1;
                                const visibleMinutes = 1440 / zoomLevel;
                                const startMinute = graph.zoomOffset || 0;
                                const yRange = graph.maxY - graph.minY;
                                const xRatio = (coords.x - startMinute) / visibleMinutes;
                                const yRatio = 1 - (coords.y - graph.minY) / yRange;
                                touchedPoint.style.left = `${Math.max(0, Math.min(1, xRatio)) * 100}%`;
                                touchedPoint.style.top = `${Math.max(0, Math.min(1, yRatio)) * 100}%`;
                                this.updateCurrentValueMulti(entityId, graphIndex, section);
                                showDragTooltip(coords);
                            }
                        }
                    } else {
                        // Started on empty area - pan (if zoomed)
                        const zoomLevel = graph.zoomLevel || 1;
                        if (zoomLevel > 1) {
                            e.preventDefault();
                            isPanning = true;
                            const rect = graphContainer.getBoundingClientRect();
                            const deltaX = lastTouchX - touch.clientX;
                            const minutesPerPixel = (1440 / zoomLevel) / rect.width;
                            graph.zoomOffset = Math.max(0, Math.min(1440 - 1440 / zoomLevel, (graph.zoomOffset || 0) + deltaX * minutesPerPixel));
                            this.panel.updateGraphSection(entityId, graphIndex, section);
                        }
                    }
                    lastTouchX = touch.clientX;
                    lastTouchY = touch.clientY;
                }
            } else if (e.touches.length === 2) {
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const zoomLevel = graph.zoomLevel || 1;

                if (lastTouchDistance > 0) {
                    const scale = distance / lastTouchDistance;
                    if (scale > 1.1 && zoomLevel < 96) {
                        graph.zoomLevel = zoomLevel * 2;
                        this.panel.updateGraphSection(entityId, graphIndex, section);
                    } else if (scale < 0.9 && zoomLevel > 1) {
                        graph.zoomLevel = zoomLevel / 2;
                        graph.zoomOffset = Math.max(0, Math.min((graph.zoomOffset || 0), 1440 - 1440 / graph.zoomLevel));
                        this.panel.updateGraphSection(entityId, graphIndex, section);
                    }
                }
                lastTouchDistance = distance;
            }
        }, { passive: false });

        graphContainer.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            const now = Date.now();

            if (ignoreTouch) {
                ignoreTouch = false;
                return;
            }
            const scheduler = this.schedulers[entityId];
            const graph = scheduler?.graphs?.[graphIndex];

            // If it was a short tap without movement, add a new point (if not on existing point)
            if (!hasMoved && touchDuration < 300 && e.changedTouches.length === 1 && !touchedPoint) {
                const touch = e.changedTouches[0];
                if (graph) {
                    this.panel.saveUndoState(entityId);
                    const coords = getTouchCoords(touch);
                    if (coords) {
                        const existingIndex = graph.points.findIndex(p => Math.abs(p.x - coords.x) < 1);
                        if (existingIndex === -1) {
                            graph.points.push(coords);
                            graph.points.sort((a, b) => a.x - b.x);
                            this.renderGraphSection(entityId, graphIndex, section);
                        }
                    }
                }
            } else if (!hasMoved && touchDuration < DOUBLE_TAP_DELETE_MS && touchedPoint && dragPointIndex >= 0) {
                // Double-tap detection on point (only delete on a second tap)
                if (lastTapIndex === dragPointIndex && (now - lastTapTime) < DOUBLE_TAP_DELETE_MS) {
                    if (graph && graph.points.length > 2) {
                        this.panel.saveUndoState(entityId);
                        graph.points.splice(dragPointIndex, 1);
                        this.renderGraphSection(entityId, graphIndex, section);
                    }
                    lastTapIndex = null;
                    lastTapTime = 0;
                } else {
                    lastTapIndex = dragPointIndex;
                    lastTapTime = now;
                }
            }

            // Clear dragging state
            if (isDraggingPoint && touchedPoint) {
                touchedPoint.classList.remove('dragging');
            }

            // Hide drag tooltip on release
            this.hidePointTooltipMulti(section);

            // Refresh graph visuals after dragging completes
            if (isDraggingPoint && graph) {
                this.renderGraphSection(entityId, graphIndex, section);
                this.updateCurrentValueMulti(entityId, graphIndex, section);
            }

            isPanning = false;
            isDraggingPoint = false;
            dragPointIndex = -1;
            lastTouchDistance = 0;
            touchedPoint = null;
            hasMoved = false;
        }, { passive: true });
    }

    /**
     * Handle mouse move hover effects for multi-graph mode
     */
    handleGraphMouseMoveMulti(e, entityId, graphIndex, section) {
        if (e.target.classList.contains('point') || e.buttons !== 0) {
            section.querySelectorAll('.curve-tooltip, .hover-line, .hover-dot').forEach(el => el.remove());
            return;
        }

        const scheduler = this.schedulers[entityId];
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;
        const graph = scheduler.graphs[graphIndex];
        if (!graph) return;
        const graphContainer = section.querySelector('[data-graph]');
        if (!graphContainer) return;
        const rect = graphContainer.getBoundingClientRect();

        const zoomLevel = graph.zoomLevel || 1;
        const zoomOffset = graph.zoomOffset || 0;
        const visibleMinutes = 1440 / zoomLevel;
        const startMinute = zoomOffset;
        const yRange = graph.maxY - graph.minY;
        const unit = graph.unit || '';

        const xRatio = (e.clientX - rect.left) / rect.width;
        const xMinutes = startMinute + xRatio * visibleMinutes;

        const yValue = interpolateValue(xMinutes, graph.points, graph.mode, graph.minY, graph.maxY);

        const xPercent = xRatio * 100;
        const yPercent = (1 - (yValue - graph.minY) / yRange) * 100;

        section.querySelectorAll('.curve-tooltip, .hover-line, .hover-dot').forEach(el => el.remove());

        const hoverLine = document.createElement('div');
        hoverLine.className = 'hover-line';
        hoverLine.style.left = `${xPercent}%`;
        graphContainer.appendChild(hoverLine);

        const hoverDot = document.createElement('div');
        hoverDot.className = 'hover-dot';
        hoverDot.style.left = `${xPercent}%`;
        hoverDot.style.top = `${yPercent}%`;
        graphContainer.appendChild(hoverDot);

        const tooltip = document.createElement('div');
        tooltip.className = 'curve-tooltip';
        tooltip.innerHTML = `
            <span class="time">${minutesToTime(Math.round(xMinutes))}</span>
            <span class="value">${yValue.toFixed(1)}${unit}</span>
        `;
        tooltip.style.left = `${xPercent}%`;
        tooltip.style.top = `${yPercent}%`;
        tooltip.classList.add(yPercent < 20 ? 'below' : 'above');
        graphContainer.appendChild(tooltip);
    }

    /**
     * Handle mouse leave for multi-graph mode
     */
    handleGraphMouseLeaveMulti(e, entityId, graphIndex, section) {
        if (section && section.querySelectorAll) {
            section.querySelectorAll('.curve-tooltip, .hover-line, .hover-dot').forEach(el => el.remove());
        }
    }
}



// === SERVICES ===
/**
 * Universal Scheduler - Services Module
 * Home Assistant service calls for applying values, saving, and deleting schedulers
 */



/**
 * Apply scheduler value to entity
 */
function applySchedulerNow(hass, scheduler) {
    // Get current time in minutes
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Get interpolated value at current time
    const currentValue = interpolateValue(currentMinutes, scheduler.points, scheduler.mode, scheduler.minY, scheduler.maxY);

    // Call appropriate service based on domain
    const domain = scheduler.domain;
    const targetEntity = scheduler.entityId;

    let serviceCall;
    switch (domain) {
        case 'light':
            const brightness = Math.round((currentValue / 100) * 255);
            if (brightness > 0) {
                serviceCall = hass.callService('light', 'turn_on', {
                    entity_id: targetEntity,
                    brightness: brightness,
                    transition: 2
                });
            } else {
                serviceCall = hass.callService('light', 'turn_off', {
                    entity_id: targetEntity,
                    transition: 2
                });
            }
            break;
        case 'climate':
            serviceCall = hass.callService('climate', 'set_temperature', {
                entity_id: targetEntity,
                temperature: Math.round(currentValue * 10) / 10
            });
            break;
        case 'fan':
            if (currentValue > 0) {
                serviceCall = hass.callService('fan', 'set_percentage', {
                    entity_id: targetEntity,
                    percentage: Math.round(currentValue)
                });
            } else {
                serviceCall = hass.callService('fan', 'turn_off', {
                    entity_id: targetEntity
                });
            }
            break;
        case 'cover':
            serviceCall = hass.callService('cover', 'set_cover_position', {
                entity_id: targetEntity,
                position: Math.round(currentValue)
            });
            break;
        case 'humidifier':
            serviceCall = hass.callService('humidifier', 'set_humidity', {
                entity_id: targetEntity,
                humidity: Math.round(currentValue)
            });
            break;
        case 'number':
        case 'input_number':
            serviceCall = hass.callService('number', 'set_value', {
                entity_id: targetEntity,
                value: Math.round(currentValue * 100) / 100
            });
            break;
        case 'media_player':
            serviceCall = hass.callService('media_player', 'volume_set', {
                entity_id: targetEntity,
                volume_level: currentValue / 100
            });
            break;
        default:
            console.warn('Unknown domain for apply:', domain);
            return Promise.reject(new Error(`Unknown domain: ${domain}`));
    }

    return serviceCall.then(() => {
        console.log(`Applied ${currentValue.toFixed(1)} to ${targetEntity}`);
    });
}

/**
 * Save scheduler configuration to Home Assistant (multi-graph format)
 */
function saveScheduler(hass, entityId, scheduler) {
    // Convert frontend graphs format to backend format
    const graphs = (scheduler.graphs || []).map(graph => ({
        id: graph.id,
        label: graph.label || 'Schedule',
        weekdays: graph.weekdays || [0, 1, 2, 3, 4, 5, 6],
        attribute: graph.attribute || null,
        mode: graph.mode || 'linear',
        min_y: graph.minY,
        max_y: graph.maxY,
        // undefined (use global) is saved as null, otherwise save the value
        x_snap: graph.xSnap === undefined ? null : graph.xSnap,
        y_snap: graph.ySnap || 0,
        step_to_zero: graph.stepToZero || false,
        x_axis_type: graph.xAxisType || 'time',
        x_axis_entity: graph.xAxisEntity || null,
        points: graph.points || []
    }));

    return hass.callService('universal_scheduler', 'set_schedule_config', {
        entity_id: entityId,
        target_entity: scheduler.entityId,
        name: scheduler.name,
        update_interval: scheduler.updateInterval || 300,
        enabled: scheduler.enabled,
        graphs_per_row: scheduler.graphsPerRow || 1,
        graphs: graphs
    }).then(() => {
        console.log('Scheduler saved:', entityId);
    });
}

/**
 * Delete scheduler from Home Assistant
 */
function deleteScheduler(hass, entityId) {
    return hass.callService('universal_scheduler', 'delete_scheduler', {
        entity_id: entityId
    }).then(() => {
        console.log('Scheduler deleted:', entityId);
    });
}

/**
 * Load schedulers from Home Assistant via WebSocket (multi-graph format)
 */
function loadSchedulersFromHA(hass, getEntityInfo) {
    return hass.callWS({
        type: 'universal_scheduler/get_schedulers'
    }).then(response => {
        const schedulers = response?.schedulers || {};
        const result = {};

        Object.entries(schedulers).forEach(([entityId, config]) => {
            const info = getEntityInfo(entityId);
            const entityState = hass?.states?.[entityId];
            const entityAttrs = entityState?.attributes || {};

            // Convert backend graphs to frontend format
            const graphs = (config.graphs || []).map((graph, index) => {
                const xSnapRaw = graph.x_snap;
                const ySnapRaw = graph.y_snap;

                // Derive unit from attribute using attribute config
                const attr = graph.attribute;
                const graphUnit = attr ? getAttributeUnit(attr, '') : (info.unit || '');

                return {
                id: graph.id || `graph_${index + 1}`,
                label: graph.label || `Schedule ${index + 1}`,
                weekdays: graph.weekdays || [0, 1, 2, 3, 4, 5, 6],
                attribute: graph.attribute || null,
                mode: graph.mode || 'linear',
                minY: graph.min_y ?? info.minY,
                maxY: graph.max_y ?? info.maxY,
                    // xSnap: undefined = use global, 0 = off, >0 = specific value
                    xSnap: xSnapRaw === null || xSnapRaw === undefined ? undefined : Number(xSnapRaw),
                    ySnap: ySnapRaw === undefined ? 0 : Number(ySnapRaw),
                stepToZero: graph.step_to_zero ?? false,
                xAxisType: graph.x_axis_type || 'time',
                xAxisEntity: graph.x_axis_entity || null,
                points: graph.points || [{ x: 0, y: info.minY }, { x: 1440, y: info.minY }],
                unit: graphUnit,
                // UI state (not persisted)
                zoomLevel: 1,
                zoomOffset: 0,
                isOpen: false,
                };
            });

            // If no graphs (legacy format), create one from flat config
            if (graphs.length === 0) {
                graphs.push({
                    id: 'graph_1',
                    label: config.graph_label || 'Schedule 1',
                    weekdays: config.weekdays || [0, 1, 2, 3, 4, 5, 6],
                    attribute: config.attribute || null,
                    mode: config.mode || 'linear',
                    minY: config.min_y ?? info.minY,
                    maxY: config.max_y ?? info.maxY,
                    xSnap: undefined,  // Legacy uses global by default
                    ySnap: config.y_snap ?? 0,
                    stepToZero: config.step_to_zero ?? false,
                    xAxisType: 'time',
                    xAxisEntity: null,
                    points: config.points || [{ x: 0, y: info.minY }, { x: 1440, y: info.minY }],
                    unit: info.unit || '',
                    zoomLevel: 1,
                    zoomOffset: 0,
                    isOpen: false,
                });
            }

            result[entityId] = {
                entityId: entityId,
                name: config.name || entityId,
                domain: config.domain || info.domain,
                unit: info.unit,
                enabled: config.enabled !== false,
                updateInterval: config.update_interval ?? 300,
                graphsPerRow: config.graphs_per_row || 1,
                graphs: graphs,
            };
        });

        console.log('Loaded schedulers from storage:', Object.keys(result).length);
        return result;
    });
}

/**
 * Load schedulers from switch entities (fallback)
 */
function loadSchedulersFromEntities(hass, getEntityInfo, parsePoints) {
    const entities = Object.values(hass?.states || {}).filter(
        state => state.entity_id.startsWith('switch.universal_scheduler_') ||
                 state.entity_id.startsWith('switch.scheduler_')
    );

    const result = {};

    entities.forEach(entity => {
        const attrs = entity.attributes || {};
        if (attrs.target_entity) {
            const targetEntity = attrs.target_entity;
            const info = getEntityInfo(targetEntity);

            result[targetEntity] = {
                entityId: targetEntity,
                name: attrs.friendly_name || targetEntity,
                mode: attrs.interpolation_mode || attrs.mode || 'linear',
                minY: attrs.min_value ?? info.minY,
                maxY: attrs.max_value ?? info.maxY,
                unit: info.unit,
                domain: info.domain,
                enabled: entity.state === 'on',
                snapMinutes: null,
                ySnap: attrs.y_snap ?? 0,
                stepToZero: attrs.step_to_zero ?? false,
                updateInterval: attrs.update_interval ?? 5,
                zoomLevel: 1,
                zoomOffset: 0,
                points: parsePoints(attrs.points || attrs.schedule_points)
            };
        }
    });

    return result;
}



// === MAIN PANEL ===
// Import aliases
const getEntityInfoUtil = getEntityInfo;
const applySchedulerNowAPI = applySchedulerNow;
const saveSchedulerAPI = saveScheduler;
const deleteSchedulerAPI = deleteScheduler;
const loadSchedulersFromHAAPI = loadSchedulersFromHA;
const loadSchedulersFromEntitiesAPI = loadSchedulersFromEntities;

/**
 * Universal Scheduler Panel
 * Multi-entity scheduler with curve interpolation
 *
 * Modular version - imports from separate files
 */





class UniversalSchedulerPanel extends HTMLElement {
    constructor() {
        super();
        this._initialized = false;
        this._hass = null;
        this.schedulers = {}; // Store multiple scheduler configs
        this.activeSchedulerId = null;
        this.globalSnapMinutes = 30; // Default snap interval
        this.zoomLevel = 1; // 1 = full day, 2 = 12 hours, 4 = 6 hours, etc.
        this.zoomOffset = 0; // Minutes offset for zoom pan

        // New global settings
        this.graphDisplayMode = 'toggle'; // 'all', 'toggle', 'single'
        this.openGraphs = new Set(); // Track which graphs are open in 'toggle' mode
        this.itemsPerPage = 30; // 5, 10, 30, 100, 0 (unlimited)
        this.currentPage = 1;
        this.columnsCount = 1; // 1-8 columns
        this.graphHeight = 250; // Default graph height in px

        // Search and filter
        this.searchQuery = '';
        this.activeFilters = new Set(); // Set of domain types to show (empty = all)

        // Undo/redo history per scheduler
        this.undoHistory = {}; // { entityId: [states] }
        this.redoHistory = {}; // { entityId: [states] }
        this.maxHistorySize = 50;

        // Points clipboard (persists until page refresh or overwritten)
        this.pointsClipboard = null;

        // Graph handler
        this.graphHandler = new GraphHandler(this);

        // Track backend load lifecycle to avoid clobbering local edits
        this._initialLoadComplete = false;
        this._loadPromise = null;
        this._hasLoadedSchedulers = false;

        // Restore open graphs state from sessionStorage (5 min expiry)
        this._restoreOpenGraphsState();
    }

    connectedCallback() {
        if (!this._initialized && this._hass) {
            this.init();
            this._initialized = true;
        }
    }

    set hass(hass) {
        this._hass = hass;
        if (!this._initialized) {
            this.init();
            this._initialized = true;
        }
        if (this._initialized && this._root && !this._hasLoadedSchedulers) {
            this._hasLoadedSchedulers = true;
            this.loadSchedulersFromHA();
        }
    }

    get hass() {
        return this._hass;
    }

    // Get entity domain and auto-detect min/max values
    getEntityInfo(entityId) {
        return getEntityInfoUtil(this._hass, entityId);
    }

    // Get all controllable entities for autocomplete
    getControllableEntities() {
        return getControllableEntities(this._hass);
    }

    init() {
        this.innerHTML = '';
        const root = document.createElement('div');
        root.className = 'scheduler-panel';

        root.innerHTML = `
            <style>${PANEL_STYLES}</style>
            ${PANEL_TEMPLATE}
        `;

        this.appendChild(root);
        this._root = root;

        // Restore global settings from localStorage
        this._restoreGlobalSettings();

        // Setup event listeners
        this.setupEventListeners();

        // Apply restored settings to UI elements
        this._applyGlobalSettingsToUI();

        // Load existing schedulers
        this.loadSchedulersFromHA();

        // Start current time marker update interval (every minute)
        this._timeUpdateInterval = setInterval(() => {
            this.updateAllTimeMarkers();
        }, 60000); // Update every minute

        // Handle window resize to re-render graphs
        this._resizeHandler = () => {
            // Debounce resize handler
            clearTimeout(this._resizeTimeout);
            this._resizeTimeout = setTimeout(() => {
                Object.keys(this.schedulers).forEach(entityId => {
                    if (this.isGraphOpen(entityId)) {
                        this.updateSchedulerCard(entityId);
                    }
                });
            }, 250);
        };
        window.addEventListener('resize', this._resizeHandler);
    }

    // Update time markers for all schedulers (multi-graph)
    updateAllTimeMarkers() {
        Object.keys(this.schedulers).forEach(entityId => {
            const scheduler = this.schedulers[entityId];
            const card = this._root.querySelector(`[data-entity="${entityId}"]`);
            if (!card || card.classList.contains('collapsed')) return;

            // Update each open graph section
            card.querySelectorAll('.graph-section').forEach((section, idx) => {
                if (!section.classList.contains('collapsed')) {
                    const graph = scheduler.graphs[idx];
                    if (graph) {
                        this.graphHandler.updateCurrentTimeMarkerMulti(section, graph);
                        this.graphHandler.updateCurrentValueMulti(entityId, idx, section);
                    }
                }
            });
        });
    }

    // Clean up on disconnect
    disconnectedCallback() {
        if (this._timeUpdateInterval) {
            clearInterval(this._timeUpdateInterval);
        }
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }
        if (this._resizeTimeout) {
            clearTimeout(this._resizeTimeout);
        }
    }

    setupEventListeners() {
        // Create button
        this._root.querySelector('#createBtn').addEventListener('click', () => {
            this.openCreateModal();
        });

        // Global snap select
        this._root.querySelector('#globalSnapSelect').addEventListener('change', (e) => {
            this.globalSnapMinutes = parseInt(e.target.value);
            this._saveGlobalSettings();
        });

        // Graph display mode
        this._root.querySelector('#graphDisplayMode').addEventListener('change', (e) => {
            this.graphDisplayMode = e.target.value;
            this.activeSchedulerId = null;
            this.openGraphs.clear();
            this._saveGlobalSettings();
            this.renderSchedulers();
        });

        // Items per page
        this._root.querySelector('#itemsPerPage').addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this._saveGlobalSettings();
            this.renderSchedulers();
        });

        // Columns count
        this._root.querySelector('#columnsCount').addEventListener('change', (e) => {
            this.columnsCount = parseInt(e.target.value);
            this._root.querySelector('#schedulersContainer').style.setProperty('--columns-count', this.columnsCount);
            this._saveGlobalSettings();
        });

        // Graph height
        this._root.querySelector('#graphHeight').addEventListener('change', (e) => {
            this.graphHeight = parseInt(e.target.value);
            this._root.querySelectorAll('.graph-wrapper').forEach(wrapper => {
                wrapper.style.setProperty('--graph-height', `${this.graphHeight}px`);
            });
            this._saveGlobalSettings();
            // Re-render graphs to fix paths
            Object.keys(this.schedulers).forEach(entityId => {
                this.updateSchedulerCard(entityId);
            });
        });

        // Search input
        this._root.querySelector('#searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.renderSchedulers();
        });

        // Pagination
        this._root.querySelector('#prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderSchedulers();
            }
        });

        this._root.querySelector('#nextPage').addEventListener('click', () => {
            if (this.currentPage < this.getTotalPages()) {
                this.currentPage++;
                this.renderSchedulers();
            }
        });

        // Modal events
        this._root.querySelector('#modalCancelBtn').addEventListener('click', () => {
            this.closeCreateModal();
        });

        this._root.querySelector('#modalConfirmBtn').addEventListener('click', () => {
            this.confirmCreateScheduler();
        });

        // Settings modal events
        this._root.querySelector('#settingsCloseBtn').addEventListener('click', () => {
            this._root.querySelector('#settingsModal').classList.remove('show');
        });

        this._root.querySelector('#settingsModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this._root.querySelector('#settingsModal').classList.remove('show');
            }
        });

        // Entity input autocomplete
        const entityInput = this._root.querySelector('#modalEntityInput');
        const autocompleteList = this._root.querySelector('#modalAutocomplete');

        entityInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            const entities = this.getControllableEntities();
            const matches = entities.filter(id =>
                id.toLowerCase().includes(value) ||
                (this._hass?.states[id]?.attributes?.friendly_name || '').toLowerCase().includes(value)
            ).slice(0, 10);

            if (value && matches.length > 0) {
                autocompleteList.innerHTML = matches.map(id => {
                    const state = this._hass?.states[id];
                    const name = state?.attributes?.friendly_name || id;
                    const domain = id.split('.')[0];
                    return `
                        <div class="autocomplete-item" data-entity="${id}">
                            <ha-icon icon="${getDomainIcon(domain)}"></ha-icon>
                            <span>${name}</span>
                            <span class="domain-badge">${domain}</span>
                        </div>
                    `;
                }).join('');
                autocompleteList.classList.add('show');
            } else {
                autocompleteList.classList.remove('show');
            }

            // Update entity info display
            this.updateEntityInfo(e.target.value);
        });

        autocompleteList.addEventListener('click', (e) => {
            const item = e.target.closest('.autocomplete-item');
            if (item) {
                const entityId = item.dataset.entity;
                entityInput.value = entityId;
                autocompleteList.classList.remove('show');
                this.updateEntityInfo(entityId);
            }
        });

        // Close autocomplete when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.autocomplete-wrapper')) {
                autocompleteList.classList.remove('show');
            }
        });
    }

    updateEntityInfo(entityId) {
        const info = this.getEntityInfo(entityId);
        const infoDiv = this._root.querySelector('#modalEntityInfo');

        if (entityId && this._hass?.states[entityId]) {
            this._root.querySelector('#modalDetectedType').textContent = info.domain;
            this._root.querySelector('#modalDetectedRange').textContent = `${info.minY} - ${info.maxY} ${info.unit}`;
            infoDiv.style.display = 'block';
        } else {
            infoDiv.style.display = 'none';
        }
    }

    openCreateModal() {
        this._root.querySelector('#createModal').classList.add('show');
        this._root.querySelector('#modalEntityInput').value = '';
        this._root.querySelector('#modalNameInput').value = '';
        this._root.querySelector('#modalEntityInfo').style.display = 'none';
    }

    closeCreateModal() {
        this._root.querySelector('#createModal').classList.remove('show');
    }

    confirmCreateScheduler() {
        const entityId = this._root.querySelector('#modalEntityInput').value.trim();
        const name = this._root.querySelector('#modalNameInput').value.trim();
        const mode = this._root.querySelector('#modalModeSelect').value;

        if (!entityId) {
            alert('Please select a target entity');
            return;
        }

        if (!this._hass?.states[entityId]) {
            alert('Entity not found. Please select a valid entity.');
            return;
        }

        if (this.schedulers[entityId]) {
            alert('A scheduler for this entity already exists');
            return;
        }

        const info = this.getEntityInfo(entityId);
        const friendlyName = name || this._hass.states[entityId]?.attributes?.friendly_name || entityId;

        const defaultGraph = {
            id: `graph_${Date.now()}`,
            label: 'Schedule 1',
            weekdays: [0, 1, 2, 3, 4, 5, 6],
            attribute: null,
            mode: mode,
            minY: info.minY,
            maxY: info.maxY,
            // undefined (use global) is saved as null
            xSnap: undefined,
            ySnap: 0,
            stepToZero: false,
            xAxisType: 'time',
            xAxisEntity: null,
            points: [
                { x: 0, y: info.minY },
                { x: 1440, y: info.minY }
            ],
            unit: info.unit || '',
            zoomLevel: 1,
            zoomOffset: 0,
            isOpen: true,
            controlsLeft: false,
        };

        this.schedulers[entityId] = {
            entityId: entityId,
            name: friendlyName,
            domain: info.domain,
            unit: info.unit,
            enabled: true,
            updateInterval: 300,
            graphsPerRow: 1,
            graphs: [defaultGraph],
        };

        this.closeCreateModal();
        this.renderSchedulers();
    }

    loadSchedulersFromHA() {
        // Load schedulers from backend via WebSocket API (storage-based)
        if (this._loadPromise) {
            return this._loadPromise;
        }

        this._loadPromise = loadSchedulersFromHAAPI(this._hass, (entityId) => this.getEntityInfo(entityId))
            .then((schedulers) => {
                // Merge to avoid clobbering unsaved local creations while letting backend win on conflicts
                this.schedulers = { ...this.schedulers, ...schedulers };
                this._initialLoadComplete = true;
                this._applyPendingOpenGraphs();
                this.renderSchedulers();
                return this.schedulers;
            })
            .catch((err) => {
                console.error('Failed to load from WebSocket, trying entities...', err);
                // Fallback to loading from switch entities
                this.loadSchedulersFromEntities();
            })
            .finally(() => {
                // Keep the promise reference so repeated calls reuse the settled promise
            });

        return this._loadPromise;
    }

    loadSchedulersFromEntities() {
        const loadedSchedulers = loadSchedulersFromEntitiesAPI(
            this._hass,
            (entityId) => this.getEntityInfo(entityId),
            parsePoints
        );
        this.schedulers = { ...this.schedulers, ...loadedSchedulers };
        this._initialLoadComplete = true;
        this._applyPendingOpenGraphs();
        this.renderSchedulers();
    }

    getTotalPages() {
        if (this.itemsPerPage === 0) return 1;
        const filteredCount = this.getFilteredSchedulerIds().length;
        return Math.max(1, Math.ceil(filteredCount / this.itemsPerPage));
    }

    getFilteredSchedulerIds() {
        let ids = Object.keys(this.schedulers);

        // Apply search filter
        if (this.searchQuery) {
            ids = ids.filter(id => {
                const scheduler = this.schedulers[id];
                return id.toLowerCase().includes(this.searchQuery) ||
                       scheduler.name.toLowerCase().includes(this.searchQuery);
            });
        }

        // Apply domain filter
        if (this.activeFilters.size > 0) {
            ids = ids.filter(id => {
                const scheduler = this.schedulers[id];
                return this.activeFilters.has(scheduler.domain);
            });
        }

        return ids.sort();
    }

    getPagedSchedulerIds() {
        const filtered = this.getFilteredSchedulerIds();
        if (this.itemsPerPage === 0) return filtered;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(start, start + this.itemsPerPage);
    }

    updatePagination() {
        const pagination = this._root.querySelector('#pagination');
        const totalPages = this.getTotalPages();

        if (totalPages <= 1 && this.itemsPerPage !== 0) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        this._root.querySelector('#pageInfo').textContent = `Page ${this.currentPage} of ${totalPages}`;
        this._root.querySelector('#prevPage').disabled = this.currentPage <= 1;
        this._root.querySelector('#nextPage').disabled = this.currentPage >= totalPages;
    }

    updateFilterChips() {
        const chipsContainer = this._root.querySelector('#filterChips');

        // Get unique domains from schedulers
        const domains = new Set(Object.values(this.schedulers).map(s => s.domain));

        let html = '';
        CONTROLLABLE_DOMAINS.forEach(domain => {
            if (domains.has(domain)) {
                const isActive = this.activeFilters.has(domain);
                html += `
                    <div class="filter-chip ${isActive ? 'active' : ''}" data-domain="${domain}">
                        <ha-icon icon="${getDomainIcon(domain)}"></ha-icon>
                        ${domain}
                    </div>
                `;
            }
        });

        chipsContainer.innerHTML = html;

        // Add click handlers
        chipsContainer.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const domain = chip.dataset.domain;
                if (this.activeFilters.has(domain)) {
                    this.activeFilters.delete(domain);
                } else {
                    this.activeFilters.add(domain);
                }
                this.currentPage = 1;
                this.renderSchedulers();
            });
        });
    }

    isGraphOpen(entityId) {
        switch (this.graphDisplayMode) {
            case 'all':
                return true;
            case 'toggle':
                return this.openGraphs.has(entityId);
            case 'single':
            default:
                return this.activeSchedulerId === entityId;
        }
    }

    toggleGraphOpen(entityId) {
        switch (this.graphDisplayMode) {
            case 'all':
                // All are always open, do nothing
                break;
            case 'toggle':
                if (this.openGraphs.has(entityId)) {
                    this.openGraphs.delete(entityId);
                } else {
                    this.openGraphs.add(entityId);
                }
                break;
            case 'single':
            default:
                this.activeSchedulerId = this.activeSchedulerId === entityId ? null : entityId;
                break;
        }
        this.updateAllCardStates();
    }

    updateAllCardStates() {
        const container = this._root.querySelector('#schedulersContainer');
        container.querySelectorAll('.scheduler-card').forEach(card => {
            const entityId = card.dataset.entity;
            const isOpen = this.isGraphOpen(entityId);
            const wasCollapsed = card.classList.contains('collapsed');
            card.classList.toggle('collapsed', !isOpen);

            // Ensure points editor stays hidden when graph is collapsed
            const editor = card.querySelector('[data-points-editor]');
            if (editor) {
                if (!isOpen && !editor.classList.contains('collapsed')) {
                    editor.classList.add('collapsed');
                }
            }

            // If card was just expanded, ensure first graph is opened based on display mode
            if (wasCollapsed && isOpen) {
                const scheduler = this.schedulers[entityId];
                if (scheduler && scheduler.graphs?.length > 0) {
                    // Ensure at least one graph is open based on mode
                    if (this.graphDisplayMode === 'single') {
                        // Open first graph if none are open
                        const anyOpen = scheduler.graphs.some(g => g.isOpen);
                        if (!anyOpen) {
                            scheduler.graphs[0].isOpen = true;
                        }
                    } else if (this.graphDisplayMode === 'all') {
                        // All graphs should be open
                        scheduler.graphs.forEach(g => { g.isOpen = true; });
                    }
                    // 'toggle' mode: preserve state as-is
                }

                // Use requestAnimationFrame to wait for layout, then update sections
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.updateSchedulerCard(entityId);
                        // Update graph sections based on their isOpen state
                        card.querySelectorAll('.graph-section').forEach((section, idx) => {
                            const graph = scheduler.graphs[idx];
                            if (graph) {
                                section.classList.toggle('collapsed', !graph.isOpen);
                                if (graph.isOpen) {
                                    this.updateGraphSection(entityId, idx, section);
                                }
                            }
                        });
                    });
                });
            }
        });
    }

    renderSchedulers() {
        const container = this._root.querySelector('#schedulersContainer');
        const emptyState = this._root.querySelector('#emptyState');
        const allSchedulerIds = Object.keys(this.schedulers);

        // Update filter chips
        this.updateFilterChips();

        if (allSchedulerIds.length === 0) {
            emptyState.style.display = 'block';
            container.querySelectorAll('.scheduler-card').forEach(card => card.remove());
            this._root.querySelector('#pagination').style.display = 'none';
            return;
        }

        // Check if filters result in no matches
        const filteredIds = this.getFilteredSchedulerIds();
        if (filteredIds.length === 0) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <ha-icon icon="mdi:filter-off"></ha-icon>
                <p>No schedulers match your search/filter</p>
                <p>Try adjusting your search or clearing filters</p>
            `;
            container.querySelectorAll('.scheduler-card').forEach(card => card.remove());
            this._root.querySelector('#pagination').style.display = 'none';
            return;
        }

        // Reset empty state content
        emptyState.innerHTML = `
            <ha-icon icon="mdi:calendar-clock"></ha-icon>
            <p>No schedulers configured yet</p>
            <p>Click "Create Scheduler" to add your first schedule curve</p>
        `;
        emptyState.style.display = 'none';

        // Get paginated scheduler IDs
        const pagedSchedulerIds = this.getPagedSchedulerIds();

        // Remove cards not on current page
        container.querySelectorAll('.scheduler-card').forEach(card => {
            if (!pagedSchedulerIds.includes(card.dataset.entity)) {
                card.remove();
            }
        });

        // Render each scheduler on current page
        pagedSchedulerIds.forEach(entityId => {
            let card = container.querySelector(`[data-entity="${entityId}"]`);

            if (!card) {
                card = this.createSchedulerCard(entityId);
                container.appendChild(card);
            }

            // Apply collapsed state based on display mode
            const isOpen = this.isGraphOpen(entityId);
            card.classList.toggle('collapsed', !isOpen);

            this.updateSchedulerCard(entityId);
        });

        // Update pagination
        this.updatePagination();
    }

    createSchedulerCard(entityId) {
        const scheduler = this.schedulers[entityId];
        scheduler.availableAttributes = getNumericAttributes(this._hass, scheduler.entityId);
        const card = document.createElement('div');
        card.className = 'scheduler-card collapsed'; // Start collapsed by default
        card.dataset.entity = entityId;

        const domainIcon = getDomainIcon(scheduler.domain);
        card.innerHTML = createSchedulerCardHTML(scheduler, domainIcon);

        // Setup card event listeners
        this.setupCardEventListeners(card, entityId);

        return card;
    }

    setupCardEventListeners(card, entityId) {
        // Collapse/expand toggle on header click
        card.querySelector('[data-action="toggleCollapse"]').addEventListener('click', (e) => {
            // Don't toggle if clicking on controls
            if (e.target.closest('.scheduler-controls')) return;
            this.toggleGraphOpen(entityId);
        });

        // Toggle switch (no auto-save, user must press Save)
        card.querySelector('[data-action="toggle"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveUndoState(entityId);
            const scheduler = this.schedulers[entityId];
            scheduler.enabled = !scheduler.enabled;
            e.target.classList.toggle('active', scheduler.enabled);
        });

        // Save button
        card.querySelector('[data-action="save"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveScheduler(entityId);
        });

        // Settings button - opens settings modal
        card.querySelector('[data-action="settings"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this._root.querySelector('#settingsModal').classList.add('show');
        });

        // Delete button
        card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete scheduler for ${entityId}?`)) {
                this.deleteScheduler(entityId);
            }
        });

        // Top-level scheduler settings
        card.querySelector('[data-setting="updateInterval"]').addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            this.schedulers[entityId].updateInterval = parseInt(e.target.value);
        });

        card.querySelector('[data-setting="graphsPerRow"]').addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            const value = parseInt(e.target.value);
            this.schedulers[entityId].graphsPerRow = value;
            card.querySelector('.graphs-container').style.setProperty('--graphs-per-row', value);
        });

        // Add Graph button
        card.querySelector('[data-action="addGraph"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.addGraph(entityId);
        });

        // Setup event listeners for each graph section
        card.querySelectorAll('.graph-section').forEach(section => {
            this.setupGraphSectionListeners(card, section, entityId);
        });
    }

    setupGraphSectionListeners(card, section, entityId) {
        const graphId = section.dataset.graphId;
        const graphIndex = parseInt(section.dataset.graphIndex);

        // Get the graph object - always look up fresh to avoid stale references after save/reload
        const getGraph = () => {
            const scheduler = this.schedulers[entityId];
            return scheduler?.graphs?.[graphIndex];
        };

        // Toggle graph collapse
        section.querySelector('[data-action="toggleGraph"]').addEventListener('click', (e) => {
            if (e.target.closest('.weekday-selector') || e.target.closest('[data-action="editGraphLabel"]')) return;
            this.toggleGraphSection(entityId, graphIndex, section);
        });

        // Graph label edit
        const labelEditBtn = section.querySelector('[data-action="editGraphLabel"]');
        const labelContainer = section.querySelector('.graph-label-container');
        const labelText = section.querySelector('[data-graph-label]');
        const labelInput = section.querySelector('[data-graph-label-input]');

        labelEditBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            labelContainer.classList.add('editing');
            labelInput.focus();
            labelInput.select();
        });

        labelInput.addEventListener('blur', () => {
            const newLabel = labelInput.value.trim() || `Schedule ${graphIndex + 1}`;
            this.saveUndoState(entityId);
            getGraph().label = newLabel;
            labelText.textContent = newLabel;
            labelContainer.classList.remove('editing');
        });

        labelInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                labelInput.blur();
            } else if (e.key === 'Escape') {
                labelInput.value = getGraph().label || `Schedule ${graphIndex + 1}`;
                labelContainer.classList.remove('editing');
            }
        });

        // Weekday buttons
        section.querySelectorAll('.weekday-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const graph = getGraph();
                const weekday = parseInt(btn.dataset.weekday);

                if (!graph.weekdays) {
                    graph.weekdays = [0, 1, 2, 3, 4, 5, 6];
                }

                this.saveUndoState(entityId);

                const index = graph.weekdays.indexOf(weekday);
                if (index > -1) {
                    if (graph.weekdays.length > 1) {
                        graph.weekdays.splice(index, 1);
                        btn.classList.remove('active');
                    }
                } else {
                    graph.weekdays.push(weekday);
                    graph.weekdays.sort((a, b) => a - b);
                    btn.classList.add('active');
                }
            });
        });

        // Graph settings
        section.querySelector('[data-graph-setting="mode"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            const graph = getGraph();
            graph.mode = e.target.value;
            this.updateGraphSection(entityId, graphIndex, section);
        });

        section.querySelector('[data-graph-setting="minY"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            getGraph().minY = parseFloat(e.target.value);
            this.updateGraphSection(entityId, graphIndex, section);
        });

        section.querySelector('[data-graph-setting="maxY"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            getGraph().maxY = parseFloat(e.target.value);
            this.updateGraphSection(entityId, graphIndex, section);
        });

        section.querySelector('[data-graph-setting="ySnap"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            getGraph().ySnap = parseFloat(e.target.value);
        });

        section.querySelector('[data-graph-setting="xSnap"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            // Empty value means "use global", otherwise parse as number
            const val = e.target.value;
            getGraph().xSnap = val === '' ? undefined : parseFloat(val);
        });

        section.querySelector('[data-graph-setting="attribute"]')?.addEventListener('change', (e) => {
            const val = e.target.value;
            const graph = getGraph();
            if (!graph) return;
            this.saveUndoState(entityId);
            graph.attribute = val === '' ? null : val;

            // Update range and unit based on attribute
            if (val && this._hass?.states[entityId]) {
                const entityAttrs = this._hass.states[entityId].attributes || {};

                // Use attribute config for known attributes
                if (isKnownAttribute(val)) {
                    const range = getAttributeRange(val, entityAttrs);
                    graph.minY = range.minY;
                    graph.maxY = range.maxY;
                    graph.unit = getAttributeUnit(val);
                } else {
                    // Unknown attribute - keep current range, set empty unit
                    graph.unit = '';
                }
            } else {
                // Reset to entity defaults when switching back to "state"
                const entityInfo = this.getEntityInfo(entityId);
                graph.minY = entityInfo.minY;
                graph.maxY = entityInfo.maxY;
                graph.unit = entityInfo.unit;
            }
            section.querySelector('[data-graph-setting="minY"]').value = graph.minY;
            section.querySelector('[data-graph-setting="maxY"]').value = graph.maxY;
            this.updateGraphSection(entityId, graphIndex, section);
        });

        section.querySelector('[data-graph-setting="stepToZero"]')?.addEventListener('click', (e) => {
            this.saveUndoState(entityId);
            const graph = getGraph();
            graph.stepToZero = !graph.stepToZero;
            e.target.classList.toggle('active', graph.stepToZero);
            this.graphHandler.renderGraphSection(entityId, graphIndex, section);
        });

        // Delete graph button
        section.querySelector('[data-action="deleteGraph"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const scheduler = this.schedulers[entityId];
            if (!scheduler || !Array.isArray(scheduler.graphs) || scheduler.graphs.length <= 1) {
                alert('Cannot delete: at least one graph is required');
                return;
            }
            if (confirm(`Delete graph "${getGraph().label}"?`)) {
                this.saveUndoState(entityId);
                scheduler.graphs.splice(graphIndex, 1);
                this.rerenderSchedulerCard(entityId);
            }
        });

        // Apply Now button
        section.querySelector('[data-action="applyNow"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.applyGraphNow(entityId, graphIndex);
        });

        // Graph controls menu toggle
        const toggleControlsBtn = section.querySelector('[data-action="toggleControls"]');
        const controlsMenu = section.querySelector('.graph-controls-menu');
        let lastToggleTap = 0;
        let skipNextToggleClick = false;

        // Apply persisted side on render
        controlsMenu?.classList.toggle('left-side', !!getGraph().controlsLeft);

        toggleControlsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (skipNextToggleClick) {
                skipNextToggleClick = false;
                return;
            }
            const panel = section.querySelector('.graph-controls-panel');
            panel.classList.toggle('show');
        });

        toggleControlsBtn?.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.toggleControlsSide(entityId, graphIndex, section);
        });

        toggleControlsBtn?.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastToggleTap < 350) {
                e.preventDefault();
                e.stopPropagation();
                skipNextToggleClick = true;
                this.toggleControlsSide(entityId, graphIndex, section);
            }
            lastToggleTap = now;
        });

        // Undo/Redo buttons
        section.querySelector('[data-action="undo"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.undo(entityId);
        });

        section.querySelector('[data-action="redo"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.redo(entityId);
        });

        // Zoom controls
        section.querySelector('[data-action="zoomIn"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const graph = getGraph();
            if ((graph.zoomLevel || 1) < 96) {
                graph.zoomLevel = Math.min(96, (graph.zoomLevel || 1) * 1.5);
                this.updateGraphSection(entityId, graphIndex, section);
            }
        });

        section.querySelector('[data-action="zoomOut"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const graph = getGraph();
            if ((graph.zoomLevel || 1) > 1) {
                graph.zoomLevel = Math.max(1, (graph.zoomLevel || 1) / 1.5);
                graph.zoomOffset = Math.max(0, Math.min(graph.zoomOffset || 0, 1440 - 1440 / graph.zoomLevel));
                this.updateGraphSection(entityId, graphIndex, section);
            }
        });

        section.querySelector('[data-action="zoomReset"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const graph = getGraph();
            graph.zoomLevel = 1;
            graph.zoomOffset = 0;
            this.updateGraphSection(entityId, graphIndex, section);
        });

        section.querySelector('[data-action="panLeft"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const graph = getGraph();
            const step = (1440 / (graph.zoomLevel || 1)) / 4;
            graph.zoomOffset = Math.max(0, (graph.zoomOffset || 0) - step);
            this.updateGraphSection(entityId, graphIndex, section);
        });

        section.querySelector('[data-action="panRight"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const graph = getGraph();
            const step = (1440 / (graph.zoomLevel || 1)) / 4;
            graph.zoomOffset = Math.min(1440 - 1440 / (graph.zoomLevel || 1), (graph.zoomOffset || 0) + step);
            this.updateGraphSection(entityId, graphIndex, section);
        });

        // Graph interactions
        const graphContainer = section.querySelector('[data-graph]');
        if (graphContainer) {
            graphContainer.addEventListener('mousedown', (e) => this.graphHandler.handleGraphMouseDownMulti(e, entityId, graphIndex, section));
            graphContainer.addEventListener('dblclick', (e) => this.graphHandler.handleGraphDoubleClickMulti(e, entityId, graphIndex, section));
            graphContainer.addEventListener('mousemove', (e) => this.graphHandler.handleGraphMouseMoveMulti(e, entityId, graphIndex, section));
            graphContainer.addEventListener('mouseleave', (e) => this.graphHandler.handleGraphMouseLeaveMulti(e, entityId, graphIndex, section));
            graphContainer.addEventListener('wheel', (e) => this.graphHandler.handleGraphWheelMulti(e, entityId, graphIndex, section), { passive: false });

            // Mobile/touch interactions: drag points, double-tap delete, tap add, swipe pan, pinch zoom
            this.graphHandler.setupTouchHandlersMulti(graphContainer, entityId, graphIndex, section);
        }

        // Points editor toggle
        section.querySelector('[data-action="togglePointsEditor"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const editor = section.querySelector('[data-points-editor]');
            editor.classList.toggle('collapsed');
            if (!editor.classList.contains('collapsed')) {
                this.graphHandler.renderPointsListMulti(entityId, graphIndex, section);
            }
        });

        // Points list event delegation
        const pointsList = section.querySelector('[data-points-list]');
        if (pointsList) {
            pointsList.addEventListener('change', (e) => {
                const row = e.target.closest('.point-row');
                if (!row) return;

                const pointIndex = parseInt(row.dataset.pointIndex);
                const graph = getGraph();

                if (e.target.matches('[data-point-time]')) {
                    const mins = timeToMinutes(e.target.value);
                    if (mins !== null && mins >= 0 && mins <= 1440) {
                        const hasConflict = graph.points.some((p, i) => i !== pointIndex && Math.abs(p.x - mins) < 1);
                        if (!hasConflict) {
                            this.saveUndoState(entityId);
                            graph.points[pointIndex].x = mins;
                            this.graphHandler.renderGraphSection(entityId, graphIndex, section);
                        } else {
                            e.target.value = minutesToTime(graph.points[pointIndex].x);
                        }
                    } else {
                        e.target.value = minutesToTime(graph.points[pointIndex].x);
                    }
                }

                if (e.target.matches('[data-point-value]')) {
                    let value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                        this.saveUndoState(entityId);
                        value = Math.max(graph.minY, Math.min(graph.maxY, value));
                        graph.points[pointIndex].y = value;
                        e.target.value = value.toFixed(2);
                        this.graphHandler.renderGraphSection(entityId, graphIndex, section);
                    }
                }
            });

            pointsList.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="deletePoint"]')) {
                    const row = e.target.closest('.point-row');
                    if (!row) return;

                    const pointIndex = parseInt(row.dataset.pointIndex);
                    const graph = getGraph();

                    if (graph.points.length <= 2) {
                        alert('Cannot delete: minimum 2 points required');
                        return;
                    }

                    this.saveUndoState(entityId);
                    graph.points.splice(pointIndex, 1);
                    this.graphHandler.renderGraphSection(entityId, graphIndex, section);
                    this.graphHandler.renderPointsListMulti(entityId, graphIndex, section);
                }
            });
        }

        // Add point button
        section.querySelector('[data-action="addPoint"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const graph = getGraph();
            const timeInput = section.querySelector('[data-new-point-time]');
            const valueInput = section.querySelector('[data-new-point-value]');

            const mins = timeToMinutes(timeInput.value);
            let value = parseFloat(valueInput.value);

            if (mins === null || mins < 0 || mins > 1440) {
                alert('Invalid time format. Use HH:MM (e.g., 14:30)');
                return;
            }

            if (isNaN(value)) {
                alert('Invalid value');
                return;
            }

            value = Math.max(graph.minY, Math.min(graph.maxY, value));
            this.saveUndoState(entityId);

            const existingIndex = graph.points.findIndex(p => Math.abs(p.x - mins) < 1);
            if (existingIndex !== -1) {
                graph.points[existingIndex].y = value;
            } else {
                graph.points.push({ x: mins, y: value });
            }

            timeInput.value = '';
            valueInput.value = '';

            this.graphHandler.renderGraphSection(entityId, graphIndex, section);
            this.graphHandler.renderPointsListMulti(entityId, graphIndex, section);
        });

        // Copy points button
        section.querySelector('[data-action="copyPoints"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const graph = getGraph();
            if (!graph || !graph.points) return;

            // Deep copy points to clipboard
            this.pointsClipboard = JSON.parse(JSON.stringify(graph.points));
            alert(`Copied ${graph.points.length} points to clipboard`);
        });

        // Paste points button
        section.querySelector('[data-action="pastePoints"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.pointsClipboard || this.pointsClipboard.length === 0) {
                alert('No points in clipboard. Copy points from another graph first.');
                return;
            }

            const graph = getGraph();
            if (!graph) return;

            if (!confirm(`Replace current ${graph.points?.length || 0} points with ${this.pointsClipboard.length} points from clipboard?`)) {
                return;
            }

            this.saveUndoState(entityId);

            // Deep copy from clipboard
            graph.points = JSON.parse(JSON.stringify(this.pointsClipboard));

            this.graphHandler.renderGraphSection(entityId, graphIndex, section);
            this.graphHandler.renderPointsListMulti(entityId, graphIndex, section);
        });
    }

    toggleGraphSection(entityId, graphIndex, section) {
        const scheduler = this.schedulers[entityId];
        const graph = scheduler.graphs[graphIndex];

        // Handle based on global display mode
        if (this.graphDisplayMode === 'single') {
            // Close all other graphs, open this one (unless already open)
            const wasOpen = graph.isOpen;
            scheduler.graphs.forEach((g, i) => {
                g.isOpen = false;
                const sec = this._root.querySelector(`[data-entity="${entityId}"] [data-graph-index="${i}"]`);
                if (sec) sec.classList.add('collapsed');
            });
            if (!wasOpen) {
                graph.isOpen = true;
                section.classList.remove('collapsed');
            }
        } else if (this.graphDisplayMode === 'toggle') {
            // Toggle this graph independently
            graph.isOpen = !graph.isOpen;
            section.classList.toggle('collapsed', !graph.isOpen);
        }
        // 'all' mode: graphs don't collapse

        // Save open graphs state
        this._saveOpenGraphsState();

        // Re-render the graph if it was just opened
        if (graph.isOpen) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.updateGraphSection(entityId, graphIndex, section);
                });
            });
        }
    }

    updateGraphSection(entityId, graphIndex, section) {
        const scheduler = this.schedulers[entityId];
        const graph = scheduler.graphs[graphIndex];

        // Respect per-graph control side preference on every update
        const controlsMenu = section.querySelector('.graph-controls-menu');
        controlsMenu?.classList.toggle('left-side', !!graph.controlsLeft);

        this.graphHandler.renderYAxisMulti(section, graph);
        this.graphHandler.renderXAxisMulti(section, graph);
        this.graphHandler.renderGridMulti(section, graph);
        this.graphHandler.renderGraphSection(entityId, graphIndex, section);
        this.graphHandler.updateCurrentTimeMarkerMulti(section, graph);
        this.graphHandler.updateCurrentValueMulti(entityId, graphIndex, section);
    }

    addGraph(entityId) {
        const scheduler = this.schedulers[entityId];
        if (!scheduler) return;

        const entityInfo = this.getEntityInfo(entityId);

        // Ensure graphs array exists
        if (!Array.isArray(scheduler.graphs)) {
            scheduler.graphs = [];
        }

        const newIndex = scheduler.graphs.length + 1;

        this.saveUndoState(entityId);

        scheduler.graphs.push({
            id: `graph_${Date.now()}`,
            label: `Schedule ${newIndex}`,
            weekdays: [0, 1, 2, 3, 4, 5, 6],
            attribute: null,
            mode: 'linear',
            minY: entityInfo.minY,
            maxY: entityInfo.maxY,
            unit: entityInfo.unit || '',
            xSnap: undefined,  // Use global by default
            ySnap: 0,
            stepToZero: false,
            xAxisType: 'time',
            xAxisEntity: null,
            points: [{ x: 0, y: entityInfo.minY }, { x: 1440, y: entityInfo.minY }],
            zoomLevel: 1,
            zoomOffset: 0,
            isOpen: true,
            controlsLeft: false,
        });

        this.rerenderSchedulerCard(entityId);
    }

    applyGraphNow(entityId, graphIndex) {
        const scheduler = this.schedulers[entityId];
        const graph = scheduler.graphs[graphIndex];

        // Apply the value from this specific graph
        applySchedulerNowAPI(this._hass, {
            ...scheduler,
            mode: graph.mode,
            minY: graph.minY,
            maxY: graph.maxY,
            points: graph.points,
            attribute: graph.attribute,
        });
    }

    rerenderSchedulerCard(entityId) {
        const card = this._root.querySelector(`[data-entity="${entityId}"]`);
        if (!card) return;

        // Preserve which graph control panels were open
        const openControls = new Set();
        card.querySelectorAll('.graph-section').forEach((section, index) => {
            if (section.querySelector('.graph-controls-panel')?.classList.contains('show')) {
                openControls.add(index);
            }
        });

        const scheduler = this.schedulers[entityId];
        scheduler.availableAttributes = getNumericAttributes(this._hass, scheduler.entityId);
        const domainIcon = getDomainIcon(scheduler.domain);

        card.innerHTML = createSchedulerCardHTML(scheduler, domainIcon);
        this.setupCardEventListeners(card, entityId);

        // Update all visible graph sections
        card.querySelectorAll('.graph-section').forEach((section, index) => {
            if (!section.classList.contains('collapsed')) {
                this.updateGraphSection(entityId, index, section);
            }

            // Restore open control panel state
            if (openControls.has(index)) {
                section.querySelector('.graph-controls-panel')?.classList.add('show');
            }
        });
    }

    updateSchedulerCard(entityId) {
        const card = this._root.querySelector(`[data-entity="${entityId}"]`);
        if (!card) return;

        // Update all graph sections
        card.querySelectorAll('.graph-section').forEach((section, index) => {
            if (!section.classList.contains('collapsed')) {
                this.updateGraphSection(entityId, index, section);
            }
        });
    }

    // Proxy methods for graph handler
    renderGraph(entityId) {
        this.graphHandler.renderGraph(entityId);
    }

    updateCurrentValue(entityId) {
        this.graphHandler.updateCurrentValue(entityId);
    }

    // Service methods
    applySchedulerNow(entityId) {
        const scheduler = this.schedulers[entityId];
        applySchedulerNowAPI(this._hass, scheduler)
            .catch(err => {
                console.error('Failed to apply value:', err);
                alert('Failed to apply: ' + err.message);
            });
    }

    saveScheduler(entityId) {
        const scheduler = this.schedulers[entityId];

        // Clear undo/redo history after save (config is now persisted)
        this.undoHistory[entityId] = [];
        this.redoHistory[entityId] = [];
        saveSchedulerAPI(this._hass, entityId, scheduler)
            .catch(err => {
                console.error('Failed to save scheduler:', err);
                alert('Failed to save: ' + err.message);
            });
    }

    toggleControlsSide(entityId, graphIndex, section) {
        const scheduler = this.schedulers[entityId];
        const graph = scheduler?.graphs?.[graphIndex];
        if (!graph) return;

        graph.controlsLeft = !graph.controlsLeft;
        const menu = section.querySelector('.graph-controls-menu');
        menu?.classList.toggle('left-side', graph.controlsLeft);
    }

    deleteScheduler(entityId) {
        delete this.schedulers[entityId];
        delete this.undoHistory[entityId];
        delete this.redoHistory[entityId];
        deleteSchedulerAPI(this._hass, entityId)
            .catch(err => {
                console.error('Failed to delete scheduler:', err);
            });
        this.renderSchedulers();
    }

    // Undo/Redo methods
    saveUndoState(entityId) {
        const scheduler = this.schedulers[entityId];
        if (!scheduler) return;

        // Initialize history if needed
        if (!this.undoHistory[entityId]) this.undoHistory[entityId] = [];
        if (!this.redoHistory[entityId]) this.redoHistory[entityId] = [];

        // Deep clone current state (entire graphs array for multi-graph support)
        const state = {
            enabled: scheduler.enabled,
            snapMinutes: scheduler.snapMinutes,
            updateInterval: scheduler.updateInterval,
            graphsPerRow: scheduler.graphsPerRow,
            graphs: JSON.parse(JSON.stringify(scheduler.graphs))
        };

        this.undoHistory[entityId].push(state);

        // Limit history size
        if (this.undoHistory[entityId].length > this.maxHistorySize) {
            this.undoHistory[entityId].shift();
        }

        // Clear redo stack on new action
        this.redoHistory[entityId] = [];
    }

    undo(entityId) {
        if (!this.undoHistory[entityId] || this.undoHistory[entityId].length === 0) return false;

        const scheduler = this.schedulers[entityId];
        if (!scheduler) return false;

        // Save current state to redo
        if (!this.redoHistory[entityId]) this.redoHistory[entityId] = [];
        this.redoHistory[entityId].push({
            enabled: scheduler.enabled,
            snapMinutes: scheduler.snapMinutes,
            updateInterval: scheduler.updateInterval,
            graphsPerRow: scheduler.graphsPerRow,
            graphs: JSON.parse(JSON.stringify(scheduler.graphs))
        });

        // Restore previous state
        const prevState = this.undoHistory[entityId].pop();
        Object.assign(scheduler, prevState);

        this.rerenderSchedulerCard(entityId);
        return true;
    }

    redo(entityId) {
        if (!this.redoHistory[entityId] || this.redoHistory[entityId].length === 0) return false;

        const scheduler = this.schedulers[entityId];
        if (!scheduler) return false;

        // Save current state to undo
        if (!this.undoHistory[entityId]) this.undoHistory[entityId] = [];
        this.undoHistory[entityId].push({
            enabled: scheduler.enabled,
            snapMinutes: scheduler.snapMinutes,
            updateInterval: scheduler.updateInterval,
            graphsPerRow: scheduler.graphsPerRow,
            graphs: JSON.parse(JSON.stringify(scheduler.graphs))
        });

        // Restore next state
        const nextState = this.redoHistory[entityId].pop();
        Object.assign(scheduler, nextState);

        this.rerenderSchedulerCard(entityId);
        return true;
    }

    canUndo(entityId) {
        return this.undoHistory[entityId] && this.undoHistory[entityId].length > 0;
    }

    canRedo(entityId) {
        return this.redoHistory[entityId] && this.redoHistory[entityId].length > 0;
    }

    refreshSchedulerCard(entityId) {
        // For multi-graph, we re-render the card entirely
        this.rerenderSchedulerCard(entityId);
    }

    // Utility methods exposed for graph handler
    minutesToTime(minutes) {
        return minutesToTime(minutes);
    }

    getDomainIcon(domain) {
        return getDomainIcon(domain);
    }

    interpolateValue(x, points, mode, minY, maxY) {
        return interpolateValue(x, points, mode, minY, maxY);
    }

    // ============ Open Graphs State Persistence ============

    _restoreOpenGraphsState() {
        try {
            const stored = sessionStorage.getItem('universal_scheduler_open_graphs');
            if (stored) {
                const data = JSON.parse(stored);
                const now = Date.now();
                // Check if data is less than 5 minutes old
                if (data.timestamp && (now - data.timestamp) < 5 * 60 * 1000) {
                    this._pendingOpenGraphs = data.openGraphs || {};
                    this.activeSchedulerId = data.activeSchedulerId || null;
                    console.log('Restored open graphs state:', Object.keys(this._pendingOpenGraphs).length, 'schedulers');
                } else {
                    // Data is stale, remove it
                    sessionStorage.removeItem('universal_scheduler_open_graphs');
                }
            }
        } catch (e) {
            console.warn('Failed to restore open graphs state:', e);
        }
    }

    _saveOpenGraphsState() {
        try {
            // Collect which graphs are open for each scheduler
            const openGraphs = {};
            Object.entries(this.schedulers).forEach(([entityId, scheduler]) => {
                if (scheduler.graphs) {
                    const openIndices = scheduler.graphs
                        .map((g, i) => g.isOpen ? i : -1)
                        .filter(i => i >= 0);
                    if (openIndices.length > 0) {
                        openGraphs[entityId] = openIndices;
                    }
                }
            });

            const data = {
                timestamp: Date.now(),
                openGraphs: openGraphs,
                activeSchedulerId: this.activeSchedulerId
            };
            sessionStorage.setItem('universal_scheduler_open_graphs', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save open graphs state:', e);
        }
    }

    _applyPendingOpenGraphs() {
        if (!this._pendingOpenGraphs) return;

        Object.entries(this._pendingOpenGraphs).forEach(([entityId, openIndices]) => {
            const scheduler = this.schedulers[entityId];
            if (scheduler && scheduler.graphs) {
                openIndices.forEach(index => {
                    if (scheduler.graphs[index]) {
                        scheduler.graphs[index].isOpen = true;
                    }
                });
            }
        });

        delete this._pendingOpenGraphs;
    }

    // ============ Global Settings Persistence ============

    _saveGlobalSettings() {
        try {
            const settings = {
                globalSnapMinutes: this.globalSnapMinutes,
                graphDisplayMode: this.graphDisplayMode,
                itemsPerPage: this.itemsPerPage,
                columnsCount: this.columnsCount,
                graphHeight: this.graphHeight
            };
            localStorage.setItem('universal_scheduler_global_settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save global settings:', e);
        }
    }

    _restoreGlobalSettings() {
        try {
            const stored = localStorage.getItem('universal_scheduler_global_settings');
            if (stored) {
                const settings = JSON.parse(stored);

                if (settings.globalSnapMinutes !== undefined) {
                    this.globalSnapMinutes = settings.globalSnapMinutes;
                }
                if (settings.graphDisplayMode !== undefined) {
                    this.graphDisplayMode = settings.graphDisplayMode;
                }
                if (settings.itemsPerPage !== undefined) {
                    this.itemsPerPage = settings.itemsPerPage;
                }
                if (settings.columnsCount !== undefined) {
                    this.columnsCount = settings.columnsCount;
                }
                if (settings.graphHeight !== undefined) {
                    this.graphHeight = settings.graphHeight;
                }

                console.log('Restored global settings');
            }
        } catch (e) {
            console.warn('Failed to restore global settings:', e);
        }
    }

    _applyGlobalSettingsToUI() {
        // Update UI elements with restored values
        const globalSnapSelect = this._root.querySelector('#globalSnapSelect');
        if (globalSnapSelect) {
            globalSnapSelect.value = this.globalSnapMinutes.toString();
        }

        const graphDisplayMode = this._root.querySelector('#graphDisplayMode');
        if (graphDisplayMode) {
            graphDisplayMode.value = this.graphDisplayMode;
        }

        const itemsPerPage = this._root.querySelector('#itemsPerPage');
        if (itemsPerPage) {
            itemsPerPage.value = this.itemsPerPage.toString();
        }

        const columnsCount = this._root.querySelector('#columnsCount');
        if (columnsCount) {
            columnsCount.value = this.columnsCount.toString();
            this._root.querySelector('#schedulersContainer')?.style.setProperty('--columns-count', this.columnsCount);
        }

        const graphHeight = this._root.querySelector('#graphHeight');
        if (graphHeight) {
            graphHeight.value = this.graphHeight.toString();
        }
    }
}

customElements.define('universal-curve-scheduler', UniversalSchedulerPanel);
console.log('UniversalSchedulerPanel v3 (modular) loaded');



})();
