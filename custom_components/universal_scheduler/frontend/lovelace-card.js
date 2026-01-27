/**
 * Universal Scheduler - Lovelace Card
 * A card to display and edit scheduler graphs in Lovelace dashboards
 */

import { PANEL_STYLES } from './styles.js';
import { interpolateValue, interpolateValueWithStepToMin, generateInterpolatedPath, minutesToTime, clamp, getEntityInfo as getEntityInfoUtil, getDomainIcon, getNumericAttributes, getControllableEntities, CONTROLLABLE_DOMAINS } from './utils.js';

// Card styles (subset of panel styles plus card-specific styles)
const CARD_STYLES = `
    :host {
        --card-padding: 16px;
    }

    .scheduler-card-container {
        padding: var(--card-padding);
    }

    .scheduler-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
    }

    .scheduler-card-header .entity-icon {
        color: var(--primary-color);
    }

    .scheduler-card-header .title {
        flex: 1;
        font-size: 1.1rem;
        font-weight: 500;
    }

    .scheduler-card-header .delete-btn {
        background: none;
        border: none;
        padding: 4px;
        margin: 0;
        cursor: pointer;
        color: var(--secondary-text-color);
        opacity: 0.7;
        transition: opacity 0.2s, color 0.2s;
        display: flex;
        align-items: center;
    }

    .scheduler-card-header .delete-btn:hover {
        opacity: 1;
        color: var(--error-color, #db4437);
    }

    .scheduler-card-header .state {
        font-size: 0.85rem;
        padding: 4px 10px;
        border-radius: 12px;
        background: rgba(var(--rgb-disabled-color, 158, 158, 158), 0.2);
        color: var(--disabled-text-color, #9e9e9e);
    }

    .scheduler-card-header .state.active {
        background: rgba(var(--rgb-success-color, 76, 175, 80), 0.2);
        color: var(--success-color, #4caf50);
    }

    .scheduler-card-header .header-toggle {
        flex-shrink: 0;
    }

    .graph-selector {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
    }

    .graph-selector-btn {
        padding: 6px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .graph-selector-btn:hover {
        border-color: var(--primary-color);
    }

    .graph-selector-btn.active {
        background: var(--primary-color, #03a9f4);
        color: white;
        border-color: var(--primary-color, #03a9f4);
    }

    .add-graph-btn {
        padding: 6px 12px;
        border-radius: 16px;
        border: 1px dashed var(--primary-color, #03a9f4);
        background: transparent;
        color: var(--primary-color, #03a9f4);
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .add-graph-btn:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
    }

    .add-graph-btn ha-icon {
        --mdc-icon-size: 16px;
    }

    .card-graph-wrapper {
        position: relative;
        display: flex;
        height: var(--graph-height, 200px);
        margin-bottom: 10px;
        padding-top: 20px; /* Space for NOW label */
    }

    .card-graph-y-axis {
        width: 45px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 5px 5px 20px 0;
        font-size: 0.7rem;
        text-align: right;
        opacity: 0.7;
        flex-shrink: 0;
    }

    .card-graph-container {
        flex: 1;
        position: relative;
        background: var(--secondary-background-color, var(--card-background-color, #fafafa));
        border-radius: 8px;
        overflow: visible;
    }

    .card-graph-x-axis {
        height: 20px;
        display: flex;
        justify-content: space-between;
        padding: 4px 0 0 45px;
        font-size: 0.7rem;
        opacity: 0.7;
    }

    /* Reuse graph styles from panel */
    .grid-lines {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }

    .grid-lines::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
            linear-gradient(to right, var(--divider-color, rgba(0,0,0,0.12)) 1px, transparent 1px),
            linear-gradient(to bottom, var(--divider-color, rgba(0,0,0,0.12)) 1px, transparent 1px);
        background-size: 25% 25%;
        opacity: 0.3;
    }

    .curve-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .curve-line {
        fill: none;
        stroke: var(--primary-color, #03a9f4);
        stroke-width: 2;
    }

    .fill-area {
        fill: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        stroke: none;
    }

    .point {
        position: absolute;
        width: 14px;
        height: 14px;
        background: var(--primary-color, #03a9f4);
        border: 2px solid var(--card-background-color, #fff);
        border-radius: 50%;
        cursor: grab;
        transform: translate(-50%, -50%);
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.1s;
    }

    .point:hover {
        transform: translate(-50%, -50%) scale(1.2);
    }

    .point.dragging {
        cursor: grabbing;
        transform: translate(-50%, -50%) scale(1.3);
        z-index: 11;
    }

    /* Current time marker - matches panel styles */
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

    .current-value-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        background: rgba(var(--rgb-primary-color), 0.1);
        border-radius: 6px;
        font-size: 0.85rem;
        margin-bottom: 10px;
    }

    .current-value-row .label {
        opacity: 0.7;
    }

    .current-value-row .value {
        font-weight: 600;
        color: var(--primary-color, #03a9f4);
    }

    .current-value-row button {
        margin-left: auto;
        padding: 4px 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
        background: var(--secondary-background-color, var(--card-background-color, #fafafa));
        color: var(--primary-text-color, #212121);
        font-size: 0.8rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .current-value-row button:hover {
        background: var(--primary-color, #03a9f4);
        color: white;
    }

    /* Graph settings collapsible */
    .card-graph-settings-wrapper {
        background: var(--secondary-background-color);
        border-radius: 6px;
        margin-bottom: 10px;
        overflow: hidden;
    }

    .card-graph-settings-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .card-graph-settings-header:hover {
        background: rgba(var(--rgb-primary-color), 0.08);
    }

    .card-graph-settings-header .collapse-indicator {
        transition: transform 0.2s;
        opacity: 0.6;
        --mdc-icon-size: 16px;
    }

    .card-graph-settings-wrapper.collapsed .collapse-indicator {
        transform: rotate(-90deg);
    }

    .card-graph-settings-body {
        border-top: 1px solid var(--divider-color);
        padding: 10px;
    }

    .card-graph-settings-wrapper.collapsed .card-graph-settings-body {
        display: none;
    }

    .card-graph-settings {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
    }

    .card-graph-settings .input-group {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .card-graph-settings label {
        font-size: 0.8rem;
        opacity: 0.8;
    }

    .card-graph-settings select,
    .card-graph-settings input {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 0.8rem;
    }

    .card-graph-settings .danger {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--error-color, #db4437);
        background: transparent;
        color: var(--error-color, #db4437);
        font-size: 0.75rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .card-graph-settings .danger:hover {
        background: var(--error-color, #db4437);
        color: white;
    }

    .card-graph-settings .danger ha-icon {
        --mdc-icon-size: 14px;
    }

    /* Points editor */
    .card-points-editor {
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        overflow: hidden;
    }

    .card-points-editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .card-points-editor-header:hover {
        background: rgba(var(--rgb-primary-color), 0.08);
    }

    .card-points-editor-header ha-icon {
        --mdc-icon-size: 18px;
        opacity: 0.7;
        transition: transform 0.2s;
    }

    .card-points-editor.collapsed .card-points-editor-header ha-icon {
        transform: rotate(-90deg);
    }

    .card-points-editor-content {
        max-height: 200px;
        overflow-y: auto;
        border-top: 1px solid var(--divider-color);
    }

    .card-points-editor.collapsed .card-points-editor-content {
        display: none;
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
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 0.8rem;
    }

    .point-row .delete-point {
        padding: 2px 6px;
        background: none;
        border: none;
        color: var(--error-color, #f44336);
        cursor: pointer;
        opacity: 0.7;
    }

    .point-row .delete-point:hover {
        opacity: 1;
    }

    .add-point-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-top: 1px solid var(--divider-color);
        background: rgba(var(--rgb-primary-color), 0.03);
    }

    .add-point-row input {
        width: 70px;
        padding: 4px 6px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 0.8rem;
    }

    .add-point-row button {
        padding: 4px 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 0.8rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .add-point-row button:hover {
        background: var(--primary-color);
        color: white;
    }

    .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        background: var(--disabled-color, #bdbdbd);
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
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
    }

    .toggle-switch.active::after {
        transform: translateX(20px);
    }

    .toggle-switch.small {
        width: 36px;
        height: 20px;
    }

    .toggle-switch.small::after {
        width: 16px;
        height: 16px;
    }

    .toggle-switch.small.active::after {
        transform: translateX(16px);
    }

    /* Weekday selector */
    .card-weekday-selector {
        display: flex;
        gap: 4px;
        margin-bottom: 10px;
    }

    .card-weekday-btn {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .card-weekday-btn:hover {
        border-color: var(--primary-color);
    }

    .card-weekday-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }

    /* No scheduler message */
    .no-scheduler {
        text-align: center;
        padding: 30px 20px;
    }

    .no-scheduler ha-icon {
        font-size: 48px;
        margin-bottom: 10px;
        opacity: 0.6;
    }

    .no-scheduler p {
        opacity: 0.6;
    }

    .no-scheduler .add-schedule-btn {
        margin-top: 16px;
        padding: 10px 20px;
        border-radius: 8px;
        border: 2px dashed var(--primary-color, #03a9f4);
        background: transparent;
        color: var(--primary-color, #03a9f4);
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        opacity: 1;
    }

    .no-scheduler .add-schedule-btn:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
        border-style: solid;
    }

    .no-scheduler .add-schedule-btn ha-icon {
        font-size: 20px;
        --mdc-icon-size: 20px;
        opacity: 1;
    }

    /* Delete scheduler button */
    .delete-scheduler-btn {
        padding: 4px 10px;
        border-radius: 4px;
        border: 1px solid var(--error-color, #db4437);
        background: transparent;
        color: var(--error-color, #db4437);
        font-size: 0.75rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
    }

    .delete-scheduler-btn:hover {
        background: var(--error-color, #db4437);
        color: white;
    }

    .delete-scheduler-btn ha-icon {
        --mdc-icon-size: 14px;
    }

    /* Tooltip */
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

    .curve-tooltip .time {
        font-weight: 600;
        color: var(--primary-color);
    }

    .curve-tooltip .value {
        margin-left: 8px;
        opacity: 0.9;
    }

    /* Edit action buttons */
    .edit-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
        padding: 8px;
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 6px;
        align-items: center;
    }

    .edit-actions .action-btn {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 0.8rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s;
    }

    .edit-actions .action-btn:hover:not(:disabled) {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
    }

    .edit-actions .action-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .edit-actions .action-btn.save {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }

    .edit-actions .action-btn.save:hover:not(:disabled) {
        background: var(--primary-color);
        filter: brightness(1.1);
    }

    .edit-actions .action-btn.reset {
        color: var(--error-color, #f44336);
        border-color: var(--error-color, #f44336);
    }

    .edit-actions .action-btn.reset:hover:not(:disabled) {
        background: rgba(244, 67, 54, 0.1);
    }

    .edit-actions .spacer {
        flex: 1;
    }

    .edit-actions .changes-indicator {
        font-size: 0.75rem;
        color: var(--warning-color, #ff9800);
        display: flex;
        align-items: center;
        gap: 4px;
    }
`;

// Card Editor for GUI configuration
class UniversalSchedulerCardEditor extends HTMLElement {
    constructor() {
        super();
        this._config = {};
        this._hass = null;
        this._schedulers = [];
        this._filteredSchedulers = [];
        this._showAutocomplete = false;
        this._initialLoadDone = false;
    }

    set hass(hass) {
        this._hass = hass;
        // Only load schedulers on initial load, not on every hass update
        if (!this._initialLoadDone) {
            this._loadSchedulers();
        }
    }

    setConfig(config) {
        this._config = config;
        this._render();
    }

    async _loadSchedulers() {
        if (!this._hass) return;

        // Build a set of entities that already have schedulers
        let schedulerEntityIds = new Set();

        try {
            // Load schedulers from WebSocket API
            const result = await this._hass.callWS({
                type: 'universal_scheduler/get_schedulers'
            });

            const schedulers = result.schedulers || {};
            schedulerEntityIds = new Set(Object.keys(schedulers));
        } catch (e) {
            console.error('Failed to load schedulers:', e);
            // Fallback: try to find from switch entities
            Object.keys(this._hass.states)
                .filter(id => id.startsWith('switch.universal_scheduler_'))
                .forEach(id => {
                    schedulerEntityIds.add(id.replace('switch.universal_scheduler_', '').replace(/_/g, '.'));
                });
        }

        // Get all controllable entities from HA
        const controllableEntities = Object.keys(this._hass.states)
            .filter(entityId => {
                const domain = entityId.split('.')[0];
                return CONTROLLABLE_DOMAINS.includes(domain);
            })
            .sort();

        // Create list of all entities, marking those with schedulers
        this._schedulers = controllableEntities.map(entityId => {
            const state = this._hass.states[entityId];
            const domain = entityId.split('.')[0];
            const hasScheduler = schedulerEntityIds.has(entityId);
            return {
                entityId: entityId,
                switchEntity: hasScheduler ? `switch.universal_scheduler_${entityId.replace(/\./g, '_')}` : null,
                name: state?.attributes?.friendly_name || entityId,
                domain: domain,
                hasScheduler: hasScheduler
            };
        });

        this._filteredSchedulers = [...this._schedulers];
        this._initialLoadDone = true;
        this._render();
    }

    _render() {
        if (!this._hass) return;

        // Find current selected scheduler name
        const currentScheduler = this._schedulers.find(s =>
            s.switchEntity === this._config.entity || s.entityId === this._config.entity
        );
        const currentValue = currentScheduler ? currentScheduler.name : (this._config.entity || '');

        this.innerHTML = `
            <style>
                .editor-row {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .editor-row label {
                    font-weight: 500;
                    font-size: 0.9rem;
                }
                .editor-row select,
                .editor-row input {
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid var(--divider-color);
                    background: var(--secondary-background-color);
                    color: var(--primary-text-color);
                    font-size: 0.9rem;
                }
                .editor-row .hint {
                    font-size: 0.8rem;
                    opacity: 0.7;
                }
                .editor-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .editor-checkbox input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                }
                .autocomplete-wrapper {
                    position: relative;
                }
                .autocomplete-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--card-background-color, #fff);
                    border: 1px solid var(--divider-color);
                    border-radius: 4px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 100;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
                    background: rgba(var(--rgb-primary-color), 0.1);
                }
                .autocomplete-item .item-name {
                    flex: 1;
                    font-weight: 500;
                }
                .autocomplete-item .item-entity {
                    font-size: 0.8rem;
                    opacity: 0.6;
                }
                .autocomplete-item ha-icon {
                    --mdc-icon-size: 20px;
                    color: var(--primary-color);
                }
                .autocomplete-item.has-scheduler {
                    background: rgba(var(--rgb-success-color, 76, 175, 80), 0.1);
                }
                .autocomplete-item .scheduler-badge {
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    border-radius: 8px;
                    background: var(--success-color, #4caf50);
                    color: white;
                    white-space: nowrap;
                }
                .no-results {
                    padding: 12px;
                    text-align: center;
                    opacity: 0.6;
                    font-size: 0.9rem;
                }
            </style>

            <div class="editor-row">
                <label>Target Entity</label>
                <div class="autocomplete-wrapper">
                    <input type="text" id="entity-search" value="${currentValue}" placeholder="Search entities..." autocomplete="off">
                    <div class="autocomplete-list" id="autocomplete-list">
                        ${this._renderAutocompleteItems()}
                    </div>
                </div>
                <span class="hint">Search and select an entity to schedule (entities with existing schedules are highlighted)</span>
            </div>

            <div class="editor-row">
                <label>Graph Index (optional)</label>
                <input type="number" id="graph_index" min="0" value="${this._config.graph_index ?? ''}" placeholder="All graphs">
                <span class="hint">Leave empty to show all graphs, or enter index (0, 1, 2...) for specific graph</span>
            </div>

            <div class="editor-row">
                <label>Graph Height</label>
                <input type="number" id="graph_height" min="100" max="600" value="${this._config.graph_height || 200}" placeholder="200">
                <span class="hint">Height of the graph in pixels</span>
            </div>

            <div class="editor-checkbox">
                <input type="checkbox" id="show_header" ${this._config.show_header !== false ? 'checked' : ''}>
                <label for="show_header">Show card header</label>
            </div>

            <div class="editor-checkbox">
                <input type="checkbox" id="allow_edit" ${this._config.allow_edit !== false ? 'checked' : ''}>
                <label for="allow_edit">Allow editing points</label>
            </div>

            <div class="editor-checkbox" style="margin-left: 24px; ${this._config.allow_edit === false ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <input type="checkbox" id="show_graph_settings" ${this._config.show_graph_settings && this._config.allow_edit !== false ? 'checked' : ''} ${this._config.allow_edit === false ? 'disabled' : ''}>
                <label for="show_graph_settings">Show graph settings</label>
            </div>

            <div class="editor-checkbox" style="margin-left: 48px; ${this._config.allow_edit === false || !this._config.show_graph_settings ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <input type="checkbox" id="allow_schedule_editing" ${this._config.allow_schedule_editing && this._config.allow_edit !== false && this._config.show_graph_settings ? 'checked' : ''} ${this._config.allow_edit === false || !this._config.show_graph_settings ? 'disabled' : ''}>
                <label for="allow_schedule_editing">Allow editing of schedules</label>
            </div>

            <div class="editor-checkbox" style="margin-left: 48px; ${this._config.allow_edit === false || !this._config.show_graph_settings ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <input type="checkbox" id="allow_advanced_settings" ${this._config.allow_advanced_settings && this._config.allow_edit !== false && this._config.show_graph_settings ? 'checked' : ''} ${this._config.allow_edit === false || !this._config.show_graph_settings ? 'disabled' : ''}>
                <label for="allow_advanced_settings">Allow advanced settings (update interval, override behavior)</label>
            </div>

            <div class="editor-checkbox" style="margin-left: 24px; ${this._config.allow_edit === false ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <input type="checkbox" id="show_points_editor" ${this._config.show_points_editor && this._config.allow_edit !== false ? 'checked' : ''} ${this._config.allow_edit === false ? 'disabled' : ''}>
                <label for="show_points_editor">Show points editor</label>
            </div>

            <div class="editor-checkbox" style="margin-left: 24px; ${this._config.allow_edit === false ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <input type="checkbox" id="show_weekdays" ${this._config.show_weekdays && this._config.allow_edit !== false ? 'checked' : ''} ${this._config.allow_edit === false ? 'disabled' : ''}>
                <label for="show_weekdays">Show weekday selector</label>
            </div>

            <div class="editor-checkbox">
                <input type="checkbox" id="show_current_value" ${this._config.show_current_value !== false ? 'checked' : ''}>
                <label for="show_current_value">Show current value display</label>
            </div>

            <div class="editor-checkbox">
                <input type="checkbox" id="allow_toggle" ${this._config.allow_toggle ? 'checked' : ''}>
                <label for="allow_toggle">Allow toggling scheduler on/off from header</label>
            </div>
        `;

        // Setup event listeners
        this._setupEventListeners();
    }

    _renderAutocompleteItems() {
        if (this._filteredSchedulers.length === 0) {
            return '<div class="no-results">No entities found</div>';
        }

        return this._filteredSchedulers.map(scheduler => `
            <div class="autocomplete-item ${scheduler.hasScheduler ? 'has-scheduler' : ''}" data-entity="${scheduler.entityId}" data-has-scheduler="${scheduler.hasScheduler}">
                <ha-icon icon="${this._getDomainIcon(scheduler.domain)}"></ha-icon>
                <span class="item-name">${scheduler.name}</span>
                <span class="item-entity">${scheduler.entityId}</span>
                ${scheduler.hasScheduler ? '<span class="scheduler-badge">Has Schedule</span>' : ''}
            </div>
        `).join('');
    }

    _getDomainIcon(domain) {
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
        return icons[domain] || 'mdi:calendar-clock';
    }

    _setupEventListeners() {
        const searchInput = this.querySelector('#entity-search');
        const autocompleteList = this.querySelector('#autocomplete-list');

        // Search input events
        searchInput.addEventListener('focus', () => {
            this._filteredSchedulers = [...this._schedulers];
            this._updateAutocompleteList();
            autocompleteList.classList.add('show');
        });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this._filteredSchedulers = this._schedulers.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.entityId.toLowerCase().includes(query)
            );
            this._updateAutocompleteList();
            autocompleteList.classList.add('show');
        });

        searchInput.addEventListener('blur', () => {
            // Delay to allow click on autocomplete item
            setTimeout(() => {
                autocompleteList.classList.remove('show');
            }, 200);
        });

        // Autocomplete item clicks
        autocompleteList.addEventListener('click', (e) => {
            const item = e.target.closest('.autocomplete-item');
            if (item) {
                const entityId = item.dataset.entity;
                const scheduler = this._schedulers.find(s => s.entityId === entityId);
                if (scheduler) {
                    searchInput.value = scheduler.name;
                    // Store entityId directly - the card will handle creating/loading scheduler
                    this._valueChanged('entity', entityId);
                }
                autocompleteList.classList.remove('show');
            }
        });

        // Other field listeners
        this.querySelector('#graph_index').addEventListener('change', (e) => {
            const val = e.target.value === '' ? undefined : parseInt(e.target.value);
            this._valueChanged('graph_index', val);
        });
        this.querySelector('#graph_height').addEventListener('change', (e) => this._valueChanged('graph_height', parseInt(e.target.value)));
        this.querySelector('#show_header').addEventListener('change', (e) => this._valueChanged('show_header', e.target.checked));
        this.querySelector('#allow_edit').addEventListener('change', (e) => {
            this._valueChanged('allow_edit', e.target.checked);
            // If disabling edit, also disable dependent options
            if (!e.target.checked) {
                this._valueChanged('show_graph_settings', false);
                this._valueChanged('show_points_editor', false);
                this._valueChanged('allow_schedule_editing', false);
                this._valueChanged('allow_advanced_settings', false);
            }
            this._render();
        });
        this.querySelector('#show_graph_settings').addEventListener('change', (e) => {
            this._valueChanged('show_graph_settings', e.target.checked);
            // If disabling graph settings, also disable allow_schedule_editing and allow_advanced_settings
            if (!e.target.checked) {
                this._valueChanged('allow_schedule_editing', false);
                this._valueChanged('allow_advanced_settings', false);
            }
            this._render();
        });
        this.querySelector('#allow_schedule_editing').addEventListener('change', (e) => this._valueChanged('allow_schedule_editing', e.target.checked));
        this.querySelector('#allow_advanced_settings').addEventListener('change', (e) => this._valueChanged('allow_advanced_settings', e.target.checked));
        this.querySelector('#show_points_editor').addEventListener('change', (e) => this._valueChanged('show_points_editor', e.target.checked));
        this.querySelector('#show_weekdays').addEventListener('change', (e) => this._valueChanged('show_weekdays', e.target.checked));
        this.querySelector('#show_current_value').addEventListener('change', (e) => this._valueChanged('show_current_value', e.target.checked));
        this.querySelector('#allow_toggle').addEventListener('change', (e) => this._valueChanged('allow_toggle', e.target.checked));
    }

    _updateAutocompleteList() {
        const list = this.querySelector('#autocomplete-list');
        if (list) {
            list.innerHTML = this._renderAutocompleteItems();
        }
    }

    _valueChanged(key, value) {
        if (value === undefined || value === '') {
            const newConfig = { ...this._config };
            delete newConfig[key];
            this._config = newConfig;
        } else {
            this._config = { ...this._config, [key]: value };
        }

        const event = new CustomEvent('config-changed', {
            detail: { config: this._config },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }
}

// Main Card
class UniversalSchedulerCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = {};
        this._hass = null;
        this._scheduler = null;
        this._selectedGraphIndex = 0;
        this._isEditing = false;
        this._dragState = null;
        // Undo/redo state
        this._pendingChanges = null;
        this._undoStack = [];
        this._redoStack = [];
        this._originalState = null;
    }

    static getConfigElement() {
        return document.createElement('universal-scheduler-card-editor');
    }

    static getStubConfig() {
        return {
            entity: '',
            show_header: true,
            show_graph_settings: false,
            show_points_editor: false,
            show_weekdays: true,
            show_current_value: true,
            allow_edit: true,
            graph_height: 200
        };
    }

    set hass(hass) {
        const oldHass = this._hass;
        this._hass = hass;

        // Load scheduler data on first hass set, or when entity state changes
        if (this._config.entity) {
            if (!oldHass) {
                // First time hass is set - load the data
                this._loadSchedulerData();
            } else {
                const oldState = oldHass.states[this._config.entity];
                const newState = hass.states[this._config.entity];

                // Re-render if state changed
                if (oldState?.state !== newState?.state ||
                    JSON.stringify(oldState?.attributes) !== JSON.stringify(newState?.attributes)) {
                    this._loadSchedulerData();
                }
            }
        }

        // Also check edit mode
        this._checkEditMode();
    }

    setConfig(config) {
        if (!config) {
            throw new Error('Invalid configuration');
        }

        this._config = {
            show_header: true,
            show_graph_settings: false,
            show_points_editor: false,
            show_weekdays: true,
            show_current_value: true,
            allow_edit: true,
            graph_height: 200,
            ...config
        };

        this._loadSchedulerData();
    }

    _checkEditMode() {
        // Check if we're in Lovelace edit mode
        const root = this.getRootNode();
        if (root && root.host) {
            const parent = root.host.closest('hui-card-preview') || root.host.closest('.edit-mode');
            this._isEditing = !!parent;
        } else {
            this._isEditing = false;
        }
    }

    async _loadSchedulerData() {
        if (!this._hass || !this._config.entity) {
            this._scheduler = null;
            this._targetEntity = null;
            this._render();
            return;
        }

        try {
            // Load scheduler data from websocket
            const result = await this._hass.callWS({
                type: 'universal_scheduler/get_schedulers'
            });

            // Determine the target entity - could be entityId directly or switch entity format
            let targetEntity = this._config.entity;
            if (targetEntity.startsWith('switch.universal_scheduler_')) {
                targetEntity = targetEntity.replace('switch.universal_scheduler_', '').replace(/_/g, '.');
            }

            // Store the target entity for creating new schedulers
            this._targetEntity = targetEntity;

            const schedulers = result.schedulers || {};

            // Try to find by entity ID
            let scheduler = null;
            for (const [entityId, data] of Object.entries(schedulers)) {
                if (entityId === targetEntity) {
                    scheduler = this._transformSchedulerData(entityId, data);
                    break;
                }
            }

            this._scheduler = scheduler;
            this._render();
        } catch (e) {
            console.error('Failed to load scheduler data:', e);
            this._scheduler = null;
            this._render();
        }
    }

    _transformSchedulerData(entityId, data) {
        const info = this._getEntityInfo(entityId);

        const graphs = (data.graphs || []).map((graph, index) => {
            const xAxisType = graph.x_axis_type || 'time';
            const isEntityBased = xAxisType === 'entity';
            const xMin = isEntityBased ? (graph.x_axis_min ?? 0) : 0;
            const xMax = isEntityBased ? (graph.x_axis_max ?? 100) : 1440;

            return {
                id: graph.id || `graph_${index + 1}`,
                label: graph.label || `Schedule ${index + 1}`,
                weekdays: graph.weekdays || [0, 1, 2, 3, 4, 5, 6],
                attribute: graph.attribute || null,
                mode: graph.mode || 'linear',
                minY: graph.min_y ?? info.minY,
                maxY: graph.max_y ?? info.maxY,
                xSnap: graph.x_snap,
                ySnap: graph.y_snap || 0,
                stepToZero: graph.step_to_zero ?? false,
                xAxisType: xAxisType,
                xAxisEntity: graph.x_axis_entity || null,
                xAxisMin: graph.x_axis_min ?? null,
                xAxisMax: graph.x_axis_max ?? null,
                xAxisUnit: graph.x_axis_unit || '',
                points: graph.points || [{ x: xMin, y: info.minY }, { x: xMax, y: info.minY }],
                unit: info.unit || '',
                zoomLevel: 1,
                zoomOffset: 0
            };
        });

        if (graphs.length === 0) {
            graphs.push({
                id: 'graph_1',
                label: 'Schedule 1',
                weekdays: [0, 1, 2, 3, 4, 5, 6],
                attribute: null,
                mode: 'linear',
                minY: info.minY,
                maxY: info.maxY,
                xSnap: undefined,
                ySnap: 0,
                stepToZero: false,
                xAxisType: 'time',
                xAxisEntity: null,
                points: [{ x: 0, y: info.minY }, { x: 1440, y: info.minY }],
                unit: info.unit || '',
                zoomLevel: 1,
                zoomOffset: 0
            });
        }

        // Get available numeric attributes for the entity
        const availableAttributes = getNumericAttributes(this._hass, entityId);

        return {
            entityId: entityId,
            name: data.name || entityId,
            domain: data.domain || info.domain,
            unit: info.unit,
            enabled: data.enabled !== false,
            updateInterval: data.update_interval ?? 300,
            graphsPerRow: data.graphs_per_row || 1,
            overrideBehavior: data.override_behavior || 'none',
            overrideDuration: data.override_duration || 3600,
            graphs: graphs,
            availableAttributes: availableAttributes
        };
    }

    _getEntityInfo(entityId) {
        if (!this._hass?.states?.[entityId]) {
            return { domain: 'unknown', minY: 0, maxY: 100, unit: '' };
        }

        const state = this._hass.states[entityId];
        const domain = entityId.split('.')[0];
        const attrs = state.attributes || {};

        let minY = 0;
        let maxY = 100;
        let unit = '';

        switch (domain) {
            case 'light':
                minY = 0;
                maxY = attrs.max_mireds || 255;
                unit = attrs.brightness !== undefined ? '%' : '';
                break;
            case 'climate':
                minY = attrs.min_temp ?? 10;
                maxY = attrs.max_temp ?? 35;
                unit = '°C';
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
            default:
                minY = attrs.min ?? 0;
                maxY = attrs.max ?? 100;
                unit = attrs.unit_of_measurement || '';
        }

        return { domain, minY, maxY, unit };
    }

    _render() {
        const showGraphSettings = this._isEditing || this._config.show_graph_settings;

        this.shadowRoot.innerHTML = `
            <style>${CARD_STYLES}</style>
            <ha-card>
                <div class="scheduler-card-container">
                    ${this._renderContent(showGraphSettings)}
                </div>
            </ha-card>
        `;

        this._setupEventListeners();
        this._renderGraph();
        this._updateTimeMarker();
        this._updateCurrentValue();

        // Start time marker update interval
        if (this._timeUpdateInterval) {
            clearInterval(this._timeUpdateInterval);
        }
        this._timeUpdateInterval = setInterval(() => {
            this._updateTimeMarker();
            this._updateCurrentValue();
        }, 60000);
    }

    _renderContent(showGraphSettings) {
        if (!this._scheduler) {
            // Check if we have a target entity and user can add schedules
            if (this._targetEntity && this._config.allow_schedule_editing && this._hass?.states[this._targetEntity]) {
                const state = this._hass.states[this._targetEntity];
                const friendlyName = state?.attributes?.friendly_name || this._targetEntity;
                const domain = this._targetEntity.split('.')[0];
                return `
                    <div class="no-scheduler">
                        <ha-icon icon="${this._getDomainIcon(domain)}"></ha-icon>
                        <p>No schedule for ${friendlyName}</p>
                        <button class="add-schedule-btn" data-action="createScheduler">
                            <ha-icon icon="mdi:plus"></ha-icon> Create Schedule
                        </button>
                    </div>
                `;
            }
            return `
                <div class="no-scheduler">
                    <ha-icon icon="mdi:calendar-clock"></ha-icon>
                    <p>No scheduler selected</p>
                    <p style="font-size: 0.85rem;">Configure this card to select an entity</p>
                </div>
            `;
        }

        const graphs = this._scheduler.graphs || [];
        const graphIndex = this._config.graph_index !== undefined ?
            Math.min(this._config.graph_index, graphs.length - 1) :
            this._selectedGraphIndex;
        const graph = this._getDisplayGraph(graphIndex);

        if (!graph) {
            return `<div class="no-scheduler"><p>No graphs available</p></div>`;
        }

        const isEntityBased = graph.xAxisType === 'entity';
        const graphHeight = this._config.graph_height || 200;
        const hasChanges = this._pendingChanges !== null;
        const canUndo = this._undoStack.length > 0;
        const canRedo = this._redoStack.length > 0;
        const allowEdit = this._config.allow_edit !== false;

        return `
            ${allowEdit && (hasChanges || canUndo || canRedo) ? `
                <div class="edit-actions">
                    <button class="action-btn" data-action="undo" ${!canUndo ? 'disabled' : ''}>
                        <ha-icon icon="mdi:undo"></ha-icon> Undo
                    </button>
                    <button class="action-btn" data-action="redo" ${!canRedo ? 'disabled' : ''}>
                        <ha-icon icon="mdi:redo"></ha-icon> Redo
                    </button>
                    <div class="spacer"></div>
                    ${hasChanges ? `
                        <span class="changes-indicator">
                            <ha-icon icon="mdi:circle-medium"></ha-icon> Unsaved changes
                        </span>
                    ` : ''}
                    <button class="action-btn reset" data-action="reset" ${!hasChanges ? 'disabled' : ''}>
                        <ha-icon icon="mdi:close"></ha-icon> Reset
                    </button>
                    <button class="action-btn save" data-action="save" ${!hasChanges ? 'disabled' : ''}>
                        <ha-icon icon="mdi:content-save"></ha-icon> Save
                    </button>
                </div>
            ` : ''}

            ${this._config.show_header !== false ? `
                <div class="scheduler-card-header">
                    <ha-icon class="entity-icon" icon="${this._getDomainIcon(this._scheduler.domain)}"></ha-icon>
                    <span class="title">${this._scheduler.name}</span>
                    ${this._config.allow_schedule_editing ? `
                        <button class="delete-btn" data-action="deleteScheduler" title="Delete schedule">
                            <ha-icon icon="mdi:delete"></ha-icon>
                        </button>
                    ` : ''}
                    ${this._config.allow_toggle ? `
                        <div class="toggle-switch header-toggle ${this._scheduler.enabled ? 'active' : ''}" data-action="toggleScheduler" title="${this._scheduler.enabled ? 'Click to disable' : 'Click to enable'}"></div>
                    ` : `
                        <span class="state ${this._scheduler.enabled ? 'active' : 'inactive'}">${this._scheduler.enabled ? 'Active' : 'Disabled'}</span>
                    `}
                </div>
            ` : ''}

            ${graphs.length > 1 || (allowEdit && this._config.allow_schedule_editing && this._config.graph_index === undefined) ? `
                <div class="graph-selector">
                    ${graphs.map((g, i) => `
                        <button class="graph-selector-btn ${i === graphIndex ? 'active' : ''}" data-index="${i}">
                            ${g.label}
                        </button>
                    `).join('')}
                    ${allowEdit && this._config.allow_schedule_editing && this._config.graph_index === undefined ? `
                        <button class="add-graph-btn" data-action="addGraph">
                            <ha-icon icon="mdi:plus"></ha-icon> Add
                        </button>
                    ` : ''}
                </div>
            ` : ''}

            ${this._config.show_weekdays !== false ? `
                <div class="card-weekday-selector">
                    <button class="card-weekday-btn ${(graph.weekdays || []).includes(1) ? 'active' : ''}" data-weekday="1">Mo</button>
                    <button class="card-weekday-btn ${(graph.weekdays || []).includes(2) ? 'active' : ''}" data-weekday="2">Tu</button>
                    <button class="card-weekday-btn ${(graph.weekdays || []).includes(3) ? 'active' : ''}" data-weekday="3">We</button>
                    <button class="card-weekday-btn ${(graph.weekdays || []).includes(4) ? 'active' : ''}" data-weekday="4">Th</button>
                    <button class="card-weekday-btn ${(graph.weekdays || []).includes(5) ? 'active' : ''}" data-weekday="5">Fr</button>
                    <button class="card-weekday-btn ${(graph.weekdays || []).includes(6) ? 'active' : ''}" data-weekday="6">Sa</button>
                    <button class="card-weekday-btn ${(graph.weekdays || []).includes(0) ? 'active' : ''}" data-weekday="0">Su</button>
                </div>
            ` : ''}

            ${showGraphSettings ? this._renderGraphSettings(graph) : ''}

            <div class="card-graph-wrapper" style="--graph-height: ${graphHeight}px;">
                <div class="card-graph-y-axis">
                    ${this._renderYAxis(graph)}
                </div>
                <div class="card-graph-container" data-graph>
                    <div class="grid-lines"></div>
                    <svg class="curve-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path class="fill-area"></path>
                        <path class="curve-line"></path>
                    </svg>
                    <div class="current-time-marker" data-time-marker></div>
                </div>
            </div>
            <div class="card-graph-x-axis">
                ${this._renderXAxis(graph)}
            </div>

            ${this._config.show_current_value !== false ? `
                <div class="current-value-row">
                    <span class="label">Current:</span>
                    <span class="value" data-current-value>--</span>
                    <span class="label">Next:</span>
                    <span class="value" data-next-value>--</span>
                    <button data-action="apply">
                        <ha-icon icon="mdi:play"></ha-icon> Apply
                    </button>
                </div>
            ` : ''}

            ${this._config.show_points_editor ? this._renderPointsEditor(graph, isEntityBased) : ''}
        `;
    }

    _renderGraphSettings(graph) {
        const ySnapValue = graph.ySnap ?? 0;
        const xSnapValue = graph.xSnap ?? 0;
        const isEntityBased = graph.xAxisType === 'entity';
        const collapsed = !this._isEditing ? 'collapsed' : '';

        // Get available attributes for the entity
        const attributes = this._scheduler?.availableAttributes || [];
        const attributeOptions = [`<option value="" ${!graph.attribute ? 'selected' : ''}>State</option>`]
            .concat(
                attributes.map(attr => `<option value="${attr}" ${graph.attribute === attr ? 'selected' : ''}>${attr}</option>`)
            ).join('');

        const graphs = this._scheduler?.graphs || [];
        const canDelete = graphs.length > 1;

        return `
            <div class="card-graph-settings-wrapper ${collapsed}">
                <div class="card-graph-settings-header" data-action="toggleSettings">
                    <ha-icon class="collapse-indicator" icon="mdi:chevron-down"></ha-icon>
                    <span>Graph Settings</span>
                </div>
                <div class="card-graph-settings-body">
                    ${this._config.allow_schedule_editing ? `
                        <div class="card-graph-settings" style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.12));">
                            <div class="input-group" style="flex: 1;">
                                <label>Label</label>
                                <input type="text" data-setting="label" value="${graph.label || ''}" placeholder="Schedule name">
                            </div>
                        </div>
                    ` : ''}
                    ${this._config.allow_advanced_settings ? `
                        <div class="card-graph-settings" style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.12));">
                            <div class="input-group">
                                <label>Update interval</label>
                                <select data-setting="updateInterval">
                                    <option value="1" ${(this._scheduler?.updateInterval || 60) === 1 ? 'selected' : ''}>1 sec</option>
                                    <option value="5" ${(this._scheduler?.updateInterval || 60) === 5 ? 'selected' : ''}>5 sec</option>
                                    <option value="10" ${(this._scheduler?.updateInterval || 60) === 10 ? 'selected' : ''}>10 sec</option>
                                    <option value="30" ${(this._scheduler?.updateInterval || 60) === 30 ? 'selected' : ''}>30 sec</option>
                                    <option value="60" ${(this._scheduler?.updateInterval || 60) === 60 ? 'selected' : ''}>1 min</option>
                                    <option value="300" ${(this._scheduler?.updateInterval || 60) === 300 ? 'selected' : ''}>5 min</option>
                                    <option value="600" ${(this._scheduler?.updateInterval || 60) === 600 ? 'selected' : ''}>10 min</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label>Override behavior</label>
                                <select data-setting="overrideBehavior">
                                    <option value="none" ${(this._scheduler?.overrideBehavior || 'none') === 'none' ? 'selected' : ''}>Ignore</option>
                                    <option value="until_next" ${(this._scheduler?.overrideBehavior || 'none') === 'until_next' ? 'selected' : ''}>Until next change</option>
                                    <option value="until_day_end" ${(this._scheduler?.overrideBehavior || 'none') === 'until_day_end' ? 'selected' : ''}>Until end of day</option>
                                    <option value="for_duration" ${(this._scheduler?.overrideBehavior || 'none') === 'for_duration' ? 'selected' : ''}>For duration</option>
                                    <option value="until_reenabled" ${(this._scheduler?.overrideBehavior || 'none') === 'until_reenabled' ? 'selected' : ''}>Until re-enabled</option>
                                </select>
                            </div>
                            <div class="input-group override-duration-group" style="display: ${(this._scheduler?.overrideBehavior || 'none') === 'for_duration' ? 'flex' : 'none'};">
                                <label>Duration</label>
                                <input type="text" data-setting="overrideDuration" value="${this._formatSecondsToDuration(this._scheduler?.overrideDuration || 3600)}" placeholder="DD:HH:MM:SS" style="width: 100px;">
                            </div>
                        </div>
                    ` : ''}
                    <div class="card-graph-settings">
                        <div class="input-group">
                            <label>Mode</label>
                            <select data-setting="mode">
                                <option value="linear" ${graph.mode === 'linear' ? 'selected' : ''}>Linear</option>
                                <option value="smooth" ${graph.mode === 'smooth' ? 'selected' : ''}>Smooth</option>
                                <option value="step" ${graph.mode === 'step' ? 'selected' : ''}>Step</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Step to min</label>
                            <div class="toggle-switch small ${graph.stepToZero ? 'active' : ''}" data-setting="stepToZero"></div>
                        </div>
                        <div class="input-group">
                            <label>Attribute</label>
                            <select data-setting="attribute">
                                ${attributeOptions}
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Y-Min</label>
                            <input type="number" data-setting="minY" value="${graph.minY}" style="width: 60px;">
                        </div>
                        <div class="input-group">
                            <label>Y-Max</label>
                            <input type="number" data-setting="maxY" value="${graph.maxY}" style="width: 60px;">
                        </div>
                        <div class="input-group">
                            <label>Y-Snap</label>
                            <select data-setting="ySnap">
                                <option value="0" ${ySnapValue === 0 ? 'selected' : ''}>Off</option>
                                <option value="0.1" ${ySnapValue === 0.1 ? 'selected' : ''}>0.1</option>
                                <option value="0.5" ${ySnapValue === 0.5 ? 'selected' : ''}>0.5</option>
                                <option value="1" ${ySnapValue === 1 ? 'selected' : ''}>1</option>
                                <option value="5" ${ySnapValue === 5 ? 'selected' : ''}>5</option>
                                <option value="10" ${ySnapValue === 10 ? 'selected' : ''}>10</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-graph-settings" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--divider-color, rgba(0,0,0,0.12));">
                        <div class="input-group">
                            <label>X-Axis</label>
                            <select data-setting="xAxisType">
                                <option value="time" ${!isEntityBased ? 'selected' : ''}>Time (24h)</option>
                                <option value="entity" ${isEntityBased ? 'selected' : ''}>Entity</option>
                            </select>
                        </div>
                        ${isEntityBased ? `
                            <div class="input-group">
                                <label>X-Entity</label>
                                <input type="text" data-setting="xAxisEntity" value="${graph.xAxisEntity || ''}" placeholder="sensor.xxx" style="width: 120px;">
                            </div>
                            <div class="input-group">
                                <label>X-Min</label>
                                <input type="number" data-setting="xAxisMin" value="${graph.xAxisMin ?? 0}" style="width: 60px;">
                            </div>
                            <div class="input-group">
                                <label>X-Max</label>
                                <input type="number" data-setting="xAxisMax" value="${graph.xAxisMax ?? 100}" style="width: 60px;">
                            </div>
                            <div class="input-group">
                                <label>X-Unit</label>
                                <input type="text" data-setting="xAxisUnit" value="${graph.xAxisUnit || ''}" placeholder="°C" style="width: 50px;">
                            </div>
                        ` : ''}
                        <div class="input-group">
                            <label>X-Snap</label>
                            <select data-setting="xSnap">
                                <option value="0" ${xSnapValue === 0 ? 'selected' : ''}>Off</option>
                                ${isEntityBased ? `
                                    <option value="0.1" ${xSnapValue === 0.1 ? 'selected' : ''}>0.1</option>
                                    <option value="0.5" ${xSnapValue === 0.5 ? 'selected' : ''}>0.5</option>
                                    <option value="1" ${xSnapValue === 1 ? 'selected' : ''}>1</option>
                                    <option value="5" ${xSnapValue === 5 ? 'selected' : ''}>5</option>
                                    <option value="10" ${xSnapValue === 10 ? 'selected' : ''}>10</option>
                                ` : `
                                    <option value="1" ${xSnapValue === 1 ? 'selected' : ''}>1 min</option>
                                    <option value="5" ${xSnapValue === 5 ? 'selected' : ''}>5 min</option>
                                    <option value="10" ${xSnapValue === 10 ? 'selected' : ''}>10 min</option>
                                    <option value="15" ${xSnapValue === 15 ? 'selected' : ''}>15 min</option>
                                    <option value="30" ${xSnapValue === 30 ? 'selected' : ''}>30 min</option>
                                    <option value="60" ${xSnapValue === 60 ? 'selected' : ''}>1 hour</option>
                                `}
                            </select>
                        </div>
                        ${canDelete ? `
                            <button class="danger" data-action="deleteGraph" title="Delete this graph">
                                <ha-icon icon="mdi:delete"></ha-icon> Delete Graph
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    _renderPointsEditor(graph, isEntityBased) {
        const points = graph.points || [];

        return `
            <div class="card-points-editor collapsed">
                <div class="card-points-editor-header" data-action="togglePointsEditor">
                    <span>Edit Points (${points.length})</span>
                    <ha-icon icon="mdi:chevron-down"></ha-icon>
                </div>
                <div class="card-points-editor-content">
                    ${points.map((p, i) => `
                        <div class="point-row" data-point-index="${i}">
                            <span class="point-index">${i + 1}</span>
                            ${isEntityBased ? `
                                <input type="number" data-field="x" value="${p.x}" placeholder="X">
                            ` : `
                                <input type="text" data-field="time" value="${this._minutesToTime(p.x)}" placeholder="HH:MM">
                            `}
                            <input type="number" data-field="y" value="${p.y}" placeholder="Value">
                            <button class="delete-point" data-action="deletePoint">×</button>
                        </div>
                    `).join('')}
                    <div class="add-point-row">
                        ${isEntityBased ? `
                            <input type="number" data-new-x placeholder="X Value">
                        ` : `
                            <input type="text" data-new-time placeholder="HH:MM">
                        `}
                        <input type="number" data-new-y placeholder="Value">
                        <button data-action="addPoint">
                            <ha-icon icon="mdi:plus"></ha-icon> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    _renderYAxis(graph) {
        const range = graph.maxY - graph.minY;
        const step = range / 4;
        const labels = [];

        for (let i = 4; i >= 0; i--) {
            const value = graph.minY + (step * i);
            labels.push(`<span>${value.toFixed(range < 10 ? 1 : 0)}</span>`);
        }

        return labels.join('');
    }

    _renderXAxis(graph) {
        const isEntityBased = graph.xAxisType === 'entity';

        if (isEntityBased) {
            const xMin = graph.xAxisMin ?? 0;
            const xMax = graph.xAxisMax ?? 100;
            const range = xMax - xMin;
            const step = range / 4;
            const labels = [];

            for (let i = 0; i <= 4; i++) {
                const value = xMin + (step * i);
                labels.push(`<span>${value.toFixed(range < 10 ? 1 : 0)}${graph.xAxisUnit || ''}</span>`);
            }

            return labels.join('');
        } else {
            // Time-based axis
            return `
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
            `;
        }
    }

    _getDomainIcon(domain) {
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

    _minutesToTime(minutes) {
        const h = Math.floor(minutes / 60) % 24;
        const m = Math.floor(minutes % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    _timeToMinutes(timeStr) {
        if (!timeStr) return null;
        const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) return null;
        const hours = parseInt(match[1], 10);
        const mins = parseInt(match[2], 10);
        if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
        return hours * 60 + mins;
    }

    _parseDurationToSeconds(durationStr) {
        // Parse duration string in DD:HH:MM:SS format to total seconds.
        // Also accepts partial formats like HH:MM:SS, MM:SS, or just SS.
        if (!durationStr || typeof durationStr !== 'string') return 3600; // Default 1 hour

        const parts = durationStr.split(':').map(p => parseInt(p.trim()) || 0);

        // Pad to 4 parts (DD:HH:MM:SS)
        while (parts.length < 4) {
            parts.unshift(0);
        }

        const [days, hours, minutes, seconds] = parts;
        return (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;
    }

    _formatSecondsToDuration(totalSeconds) {
        if (!totalSeconds || totalSeconds <= 0) return '00:01:00:00'; // Default 1 hour
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    _setupEventListeners() {
        const container = this.shadowRoot.querySelector('.scheduler-card-container');
        if (!container) return;

        // Toggle scheduler on/off
        container.querySelector('[data-action="toggleScheduler"]')?.addEventListener('click', () => {
            this._toggleSchedulerEnabled();
        });

        // Edit action buttons (undo, redo, save, reset)
        container.querySelector('[data-action="undo"]')?.addEventListener('click', () => {
            this._undo();
        });

        container.querySelector('[data-action="redo"]')?.addEventListener('click', () => {
            this._redo();
        });

        container.querySelector('[data-action="save"]')?.addEventListener('click', () => {
            this._saveChanges();
        });

        container.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
            this._resetChanges();
        });

        // Graph selector
        container.querySelectorAll('.graph-selector-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this._selectedGraphIndex = parseInt(btn.dataset.index);
                this._render();
            });
        });

        // Add graph button
        container.querySelector('[data-action="addGraph"]')?.addEventListener('click', () => {
            this._addGraph();
        });

        // Delete graph button
        container.querySelector('[data-action="deleteGraph"]')?.addEventListener('click', () => {
            this._deleteGraph();
        });

        // Create scheduler button (when no scheduler exists)
        container.querySelector('[data-action="createScheduler"]')?.addEventListener('click', () => {
            this._createScheduler();
        });

        // Delete scheduler button
        container.querySelector('[data-action="deleteScheduler"]')?.addEventListener('click', () => {
            this._deleteScheduler();
        });

        // Weekday buttons
        container.querySelectorAll('.card-weekday-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this._config.allow_edit === false) return;
                const weekday = parseInt(btn.dataset.weekday);
                this._toggleWeekday(weekday);
            });
        });

        // Settings toggle
        container.querySelector('[data-action="toggleSettings"]')?.addEventListener('click', () => {
            const wrapper = container.querySelector('.card-graph-settings-wrapper');
            wrapper?.classList.toggle('collapsed');
        });

        // Points editor toggle
        container.querySelector('[data-action="togglePointsEditor"]')?.addEventListener('click', () => {
            const editor = container.querySelector('.card-points-editor');
            editor?.classList.toggle('collapsed');
        });

        // Graph settings changes
        container.querySelectorAll('[data-setting]').forEach(el => {
            const setting = el.dataset.setting;

            if (el.classList.contains('toggle-switch')) {
                el.addEventListener('click', () => {
                    if (this._config.allow_edit === false) return;
                    el.classList.toggle('active');
                    this._updateGraphSetting(setting, el.classList.contains('active'));
                });
            } else {
                el.addEventListener('change', (e) => {
                    if (this._config.allow_edit === false) return;
                    let value = e.target.value;
                    // Parse numeric settings
                    const numericSettings = ['ySnap', 'xSnap', 'minY', 'maxY', 'xAxisMin', 'xAxisMax'];
                    if (el.type === 'number' || numericSettings.includes(setting)) {
                        value = parseFloat(value);
                    }
                    this._updateGraphSetting(setting, value);
                });
            }
        });

        // Apply button
        container.querySelector('[data-action="apply"]')?.addEventListener('click', () => {
            this._applyNow();
        });

        // Points editor inputs
        container.querySelectorAll('.point-row').forEach(row => {
            const index = parseInt(row.dataset.pointIndex);

            row.querySelector('[data-field="time"]')?.addEventListener('change', (e) => {
                if (this._config.allow_edit === false) return;
                const minutes = this._timeToMinutes(e.target.value);
                if (minutes !== null) {
                    this._updatePoint(index, 'x', minutes);
                }
            });

            row.querySelector('[data-field="x"]')?.addEventListener('change', (e) => {
                if (this._config.allow_edit === false) return;
                this._updatePoint(index, 'x', parseFloat(e.target.value));
            });

            row.querySelector('[data-field="y"]')?.addEventListener('change', (e) => {
                if (this._config.allow_edit === false) return;
                this._updatePoint(index, 'y', parseFloat(e.target.value));
            });

            row.querySelector('[data-action="deletePoint"]')?.addEventListener('click', () => {
                if (this._config.allow_edit === false) return;
                this._deletePoint(index);
            });
        });

        // Add point button
        container.querySelector('[data-action="addPoint"]')?.addEventListener('click', () => {
            if (this._config.allow_edit === false) return;
            this._addPoint();
        });

        // Setup graph interaction
        this._setupGraphInteraction();
    }

    _setupGraphInteraction() {
        const graphContainer = this.shadowRoot.querySelector('[data-graph]');
        if (!graphContainer || this._config.allow_edit === false) return;

        const graph = this._getCurrentGraph();
        if (!graph) return;

        // Mouse events for dragging points
        graphContainer.addEventListener('mousedown', (e) => this._handleMouseDown(e));
        graphContainer.addEventListener('dblclick', (e) => this._handleDoubleClick(e));
    }

    _handleMouseDown(e) {
        if (this._config.allow_edit === false) return;

        const point = e.target.closest('.point');
        if (point) {
            e.preventDefault();
            const index = parseInt(point.dataset.index);
            this._startDrag(index, e);
        }
    }

    _handleDoubleClick(e) {
        if (this._config.allow_edit === false) return;

        const graphContainer = this.shadowRoot.querySelector('[data-graph]');
        const rect = graphContainer.getBoundingClientRect();
        const graph = this._getDisplayGraph();
        if (!graph) return;

        const isEntityBased = graph.xAxisType === 'entity';
        const xMin = isEntityBased ? (graph.xAxisMin ?? 0) : 0;
        const xMax = isEntityBased ? (graph.xAxisMax ?? 100) : 1440;

        const xRatio = (e.clientX - rect.left) / rect.width;
        const yRatio = 1 - (e.clientY - rect.top) / rect.height;

        let x = xMin + xRatio * (xMax - xMin);
        let y = graph.minY + yRatio * (graph.maxY - graph.minY);

        // Snap
        const xSnap = graph.xSnap || 0;
        const ySnap = graph.ySnap || 0;
        if (xSnap > 0) x = Math.round(x / xSnap) * xSnap;
        if (ySnap > 0) y = Math.round(y / ySnap) * ySnap;

        x = Math.max(xMin, Math.min(xMax, x));
        y = Math.max(graph.minY, Math.min(graph.maxY, y));

        // Add the point
        const graphIndex = this._getGraphIndex();
        const newPoints = [...(graph.points || []), { x, y }].sort((a, b) => a.x - b.x);

        this._stageChange(graphIndex, 'points', newPoints);
    }

    _startDrag(pointIndex, startEvent) {
        const graphContainer = this.shadowRoot.querySelector('[data-graph]');
        const rect = graphContainer.getBoundingClientRect();
        const graph = this._getDisplayGraph();
        if (!graph) return;

        const point = this.shadowRoot.querySelector(`.point[data-index="${pointIndex}"]`);
        if (point) point.classList.add('dragging');

        const isEntityBased = graph.xAxisType === 'entity';
        const xMin = isEntityBased ? (graph.xAxisMin ?? 0) : 0;
        const xMax = isEntityBased ? (graph.xAxisMax ?? 100) : 1440;
        const xSnap = graph.xSnap || 0;
        const ySnap = graph.ySnap || 0;

        // Create a working copy of points for visual updates during drag
        let workingPoints = [...(graph.points || [])];

        const onMove = (e) => {
            const xRatio = (e.clientX - rect.left) / rect.width;
            const yRatio = 1 - (e.clientY - rect.top) / rect.height;

            let x = xMin + xRatio * (xMax - xMin);
            let y = graph.minY + yRatio * (graph.maxY - graph.minY);

            if (xSnap > 0) x = Math.round(x / xSnap) * xSnap;
            if (ySnap > 0) y = Math.round(y / ySnap) * ySnap;

            x = Math.max(xMin, Math.min(xMax, x));
            y = Math.max(graph.minY, Math.min(graph.maxY, y));

            // Update working copy visually
            workingPoints[pointIndex] = { x, y };
            this._renderGraphWithPoints(graph, workingPoints);
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);

            if (point) point.classList.remove('dragging');

            // Stage the changes
            const graphIndex = this._getGraphIndex();
            const newPoints = [...workingPoints].sort((a, b) => a.x - b.x);
            this._stageChange(graphIndex, 'points', newPoints);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    _getCurrentGraph() {
        if (!this._scheduler?.graphs) return null;
        const graphIndex = this._getGraphIndex();
        return this._scheduler.graphs[graphIndex];
    }

    _getDisplayGraph(graphIndexOverride = null) {
        // Returns the graph with pending changes applied (for display)
        const graphIndex = graphIndexOverride !== null ? graphIndexOverride : this._getGraphIndex();
        const graphs = this._scheduler?.graphs || [];
        const originalGraph = graphs[graphIndex];

        if (!originalGraph) return null;

        if (this._pendingChanges && this._pendingChanges.graphIndex === graphIndex) {
            return { ...originalGraph, ...this._pendingChanges.changes };
        }

        return originalGraph;
    }

    _getGraphIndex() {
        if (this._config.graph_index !== undefined) {
            return Math.min(this._config.graph_index, (this._scheduler?.graphs?.length || 1) - 1);
        }
        return this._selectedGraphIndex;
    }

    async _toggleWeekday(weekday) {
        const graph = this._getDisplayGraph();
        if (!graph) return;

        const graphIndex = this._getGraphIndex();
        let weekdays = [...(graph.weekdays || [0, 1, 2, 3, 4, 5, 6])];

        const index = weekdays.indexOf(weekday);
        if (index > -1) {
            if (weekdays.length > 1) {
                weekdays.splice(index, 1);
            }
        } else {
            weekdays.push(weekday);
            weekdays.sort((a, b) => a - b);
        }

        this._stageChange(graphIndex, 'weekdays', weekdays);
    }

    async _updateGraphSetting(setting, value) {
        // Handle scheduler-level settings (not graph-level)
        const schedulerSettings = ['updateInterval', 'overrideBehavior', 'overrideDuration'];
        if (schedulerSettings.includes(setting)) {
            if (!this._scheduler) return;

            // Handle override duration conversion
            if (setting === 'overrideDuration') {
                value = this._parseDurationToSeconds(value);
            } else if (setting === 'updateInterval') {
                value = parseInt(value, 10);
            }

            // Update scheduler property
            this._scheduler[setting] = value;

            // Show/hide duration input based on behavior
            if (setting === 'overrideBehavior') {
                const container = this.shadowRoot.querySelector('.scheduler-card-container');
                const durationGroup = container?.querySelector('.override-duration-group');
                if (durationGroup) {
                    durationGroup.style.display = value === 'for_duration' ? 'flex' : 'none';
                }
            }

            // Save immediately for scheduler settings
            await this._saveSchedulerConfig();
            return;
        }

        const graphIndex = this._getGraphIndex();

        // Map frontend setting names to internal names
        const settingMap = {
            'mode': 'mode',
            'attribute': 'attribute',
            'stepToZero': 'stepToZero',
            'minY': 'minY',
            'maxY': 'maxY',
            'ySnap': 'ySnap',
            'xSnap': 'xSnap',
            'xAxisType': 'xAxisType',
            'xAxisEntity': 'xAxisEntity',
            'xAxisMin': 'xAxisMin',
            'xAxisMax': 'xAxisMax',
            'xAxisUnit': 'xAxisUnit'
        };

        // Handle attribute special - empty string means null
        if (setting === 'attribute' && value === '') {
            value = null;
        }

        const internalSetting = settingMap[setting] || setting;
        this._stageChange(graphIndex, internalSetting, value);

        // If X-axis type changed, re-render to show/hide entity options
        if (setting === 'xAxisType') {
            this._render();
        }
    }

    _stageChange(graphIndex, property, value) {
        // Store original state on first change
        if (!this._originalState) {
            const graph = this._getCurrentGraph();
            if (graph) {
                this._originalState = JSON.parse(JSON.stringify(graph));
            }
        }

        // Initialize pending changes if needed
        if (!this._pendingChanges || this._pendingChanges.graphIndex !== graphIndex) {
            this._pendingChanges = {
                graphIndex: graphIndex,
                changes: {}
            };
        }

        // Store previous state for undo
        const graph = this._getDisplayGraph(graphIndex);
        const previousValue = graph ? graph[property] : undefined;

        // Push to undo stack
        this._undoStack.push({
            graphIndex,
            property,
            previousValue: JSON.parse(JSON.stringify(previousValue)),
            newValue: JSON.parse(JSON.stringify(value))
        });

        // Clear redo stack on new change
        this._redoStack = [];

        // Apply the change to pending
        this._pendingChanges.changes[property] = value;

        // Re-render to show changes
        this._render();
    }

    _undo() {
        if (this._undoStack.length === 0) return;

        const action = this._undoStack.pop();
        this._redoStack.push(action);

        // Revert the change
        if (this._pendingChanges && this._pendingChanges.graphIndex === action.graphIndex) {
            if (action.previousValue === undefined) {
                delete this._pendingChanges.changes[action.property];
            } else {
                this._pendingChanges.changes[action.property] = action.previousValue;
            }

            // Check if all changes reverted
            if (Object.keys(this._pendingChanges.changes).length === 0) {
                this._pendingChanges = null;
                this._originalState = null;
            }
        }

        this._render();
    }

    _redo() {
        if (this._redoStack.length === 0) return;

        const action = this._redoStack.pop();
        this._undoStack.push(action);

        // Re-apply the change
        if (!this._pendingChanges || this._pendingChanges.graphIndex !== action.graphIndex) {
            this._pendingChanges = {
                graphIndex: action.graphIndex,
                changes: {}
            };
        }

        this._pendingChanges.changes[action.property] = action.newValue;

        this._render();
    }

    _resetChanges() {
        this._pendingChanges = null;
        this._undoStack = [];
        this._redoStack = [];
        this._originalState = null;
        this._render();
    }

    async _addGraph() {
        if (!this._scheduler) return;

        const info = this._getEntityInfo(this._scheduler.entityId);
        const newIndex = this._scheduler.graphs.length + 1;

        const newGraph = {
            id: `graph_${Date.now()}`,
            label: `Schedule ${newIndex}`,
            weekdays: [0, 1, 2, 3, 4, 5, 6],
            attribute: null,
            mode: 'linear',
            minY: info.minY,
            maxY: info.maxY,
            xSnap: undefined,
            ySnap: 0,
            stepToZero: false,
            xAxisType: 'time',
            xAxisEntity: null,
            points: [{ x: 0, y: info.minY }, { x: 1440, y: info.minY }],
            unit: info.unit || '',
            zoomLevel: 1,
            zoomOffset: 0
        };

        // Add the new graph to the local scheduler
        this._scheduler.graphs.push(newGraph);

        // Save using service call
        try {
            await this._saveSchedulerConfig();

            // Select the new graph
            this._selectedGraphIndex = this._scheduler.graphs.length - 1;
            this._render();
        } catch (e) {
            // Remove the graph on failure
            this._scheduler.graphs.pop();
            console.error('Failed to add graph:', e);
        }
    }

    async _deleteGraph() {
        if (!this._scheduler) return;

        const graphs = this._scheduler.graphs || [];
        if (graphs.length <= 1) return; // Can't delete the last graph

        const graphIndex = this._getGraphIndex();

        // Store the deleted graph for potential recovery
        const deletedGraph = graphs[graphIndex];

        // Remove from local scheduler
        this._scheduler.graphs.splice(graphIndex, 1);

        // Save using service call
        try {
            await this._saveSchedulerConfig();

            // Adjust selected index
            if (this._selectedGraphIndex >= this._scheduler.graphs.length) {
                this._selectedGraphIndex = this._scheduler.graphs.length - 1;
            }
            this._render();
        } catch (e) {
            // Restore the graph on failure
            this._scheduler.graphs.splice(graphIndex, 0, deletedGraph);
            console.error('Failed to delete graph:', e);
        }
    }

    async _createScheduler() {
        if (!this._targetEntity || !this._hass) return;

        const state = this._hass.states[this._targetEntity];
        if (!state) return;

        const info = this._getEntityInfo(this._targetEntity);
        const friendlyName = state?.attributes?.friendly_name || this._targetEntity;

        // Create a new scheduler with default graph
        const defaultGraph = {
            id: `graph_${Date.now()}`,
            label: 'Schedule 1',
            weekdays: [0, 1, 2, 3, 4, 5, 6],
            attribute: null,
            mode: 'linear',
            min_y: info.minY,
            max_y: info.maxY,
            x_snap: null,
            y_snap: 0,
            step_to_zero: false,
            x_axis_type: 'time',
            x_axis_entity: null,
            x_axis_min: null,
            x_axis_max: null,
            x_axis_unit: null,
            points: [{ x: 0, y: info.minY }, { x: 1440, y: info.minY }]
        };

        try {
            await this._hass.callService('universal_scheduler', 'set_schedule_config', {
                entity_id: this._targetEntity,
                target_entity: this._targetEntity,
                domain: info.domain,
                name: friendlyName,
                update_interval: 300,
                enabled: true,
                graphs_per_row: 1,
                graphs: [defaultGraph]
            });

            // Reload data to show the new scheduler
            await this._loadSchedulerData();
        } catch (e) {
            console.error('Failed to create scheduler:', e);
        }
    }

    async _deleteScheduler() {
        if (!this._scheduler || !this._hass) return;

        // Confirm deletion
        if (!confirm(`Are you sure you want to delete the entire schedule for ${this._scheduler.name}? This cannot be undone.`)) {
            return;
        }

        try {
            await this._hass.callService('universal_scheduler', 'delete_scheduler', {
                entity_id: this._scheduler.entityId
            });

            // Clear local data and reload
            this._scheduler = null;
            await this._loadSchedulerData();
        } catch (e) {
            console.error('Failed to delete scheduler:', e);
        }
    }

    async _saveSchedulerName(newName) {
        if (!this._scheduler || !newName) return;

        // Don't save if name unchanged
        if (newName === this._scheduler.name) return;

        this._scheduler.name = newName;
        await this._saveSchedulerConfig();
        this._render();
    }

    async _saveSchedulerConfig() {
        if (!this._scheduler) return;

        // Convert frontend graphs format to backend format
        const graphs = this._scheduler.graphs.map(graph => ({
            id: graph.id,
            label: graph.label || 'Schedule',
            weekdays: graph.weekdays || [0, 1, 2, 3, 4, 5, 6],
            attribute: graph.attribute || null,
            mode: graph.mode || 'linear',
            min_y: graph.minY,
            max_y: graph.maxY,
            x_snap: graph.xSnap === undefined ? null : graph.xSnap,
            y_snap: graph.ySnap || 0,
            step_to_zero: graph.stepToZero || false,
            x_axis_type: graph.xAxisType || 'time',
            x_axis_entity: graph.xAxisEntity || null,
            x_axis_min: graph.xAxisMin ?? null,
            x_axis_max: graph.xAxisMax ?? null,
            x_axis_unit: graph.xAxisUnit || null,
            points: graph.points || []
        }));

        // Use the target entity (e.g., light.test_lamp), not the switch entity
        // This matches the panel behavior - the service expects the target entity as entity_id
        await this._hass.callService('universal_scheduler', 'set_schedule_config', {
            entity_id: this._scheduler.entityId,
            target_entity: this._scheduler.entityId,
            domain: this._scheduler.domain,
            name: this._scheduler.name,
            update_interval: this._scheduler.updateInterval || 300,
            enabled: this._scheduler.enabled,
            graphs_per_row: this._scheduler.graphsPerRow || 1,
            override_behavior: this._scheduler.overrideBehavior || 'none',
            override_duration: this._scheduler.overrideDuration || 3600,
            graphs: graphs
        });
    };

    async _saveChanges() {
        if (!this._pendingChanges || !this._scheduler) return;

        const graphIndex = this._pendingChanges.graphIndex;

        try {
            // Apply pending changes to the local scheduler graph
            const graph = this._scheduler.graphs[graphIndex];
            if (!graph) return;

            for (const [key, value] of Object.entries(this._pendingChanges.changes)) {
                graph[key] = value;
            }

            // Save using service call
            await this._saveSchedulerConfig();

            // Clear pending changes
            this._pendingChanges = null;
            this._undoStack = [];
            this._redoStack = [];
            this._originalState = null;

            // Reload data to sync with backend
            await this._loadSchedulerData();
        } catch (e) {
            console.error('Failed to save changes:', e);
        }
    }

    async _updatePoint(pointIndex, field, value) {
        const graph = this._getDisplayGraph();
        if (!graph) return;

        const graphIndex = this._getGraphIndex();
        const newPoints = [...(graph.points || [])];
        newPoints[pointIndex] = { ...newPoints[pointIndex], [field]: value };
        newPoints.sort((a, b) => a.x - b.x);

        this._stageChange(graphIndex, 'points', newPoints);
    }

    async _deletePoint(pointIndex) {
        const graph = this._getDisplayGraph();
        if (!graph || (graph.points || []).length <= 2) return;

        const graphIndex = this._getGraphIndex();
        const newPoints = (graph.points || []).filter((_, i) => i !== pointIndex);

        this._stageChange(graphIndex, 'points', newPoints);
    }

    async _addPoint() {
        const graph = this._getDisplayGraph();
        if (!graph) return;

        const container = this.shadowRoot.querySelector('.scheduler-card-container');
        const isEntityBased = graph.xAxisType === 'entity';

        let x, y;

        if (isEntityBased) {
            const xInput = container.querySelector('[data-new-x]');
            x = parseFloat(xInput?.value);
        } else {
            const timeInput = container.querySelector('[data-new-time]');
            x = this._timeToMinutes(timeInput?.value);
        }

        const yInput = container.querySelector('[data-new-y]');
        y = parseFloat(yInput?.value);

        if (x === null || isNaN(x) || isNaN(y)) return;

        const graphIndex = this._getGraphIndex();
        const newPoints = [...(graph.points || []), { x, y }].sort((a, b) => a.x - b.x);

        this._stageChange(graphIndex, 'points', newPoints);
    }

    async _updateGraphProperty(graphIndex, property, value) {
        // This is now only used for weekday toggling and other non-staged updates
        // For staged changes, use _stageChange
        if (!this._scheduler) return;

        try {
            // Get current scheduler config
            const result = await this._hass.callWS({
                type: 'universal_scheduler/get_schedulers'
            });

            const schedulers = result.schedulers || {};
            const config = schedulers[this._scheduler.entityId];

            if (!config?.graphs?.[graphIndex]) return;

            // Update the property
            config.graphs[graphIndex][property] = value;

            // Save back
            await this._hass.callWS({
                type: 'universal_scheduler/set_config',
                entity_id: this._scheduler.entityId,
                config: config
            });

            // Reload data
            await this._loadSchedulerData();
        } catch (e) {
            console.error('Failed to update graph property:', e);
        }
    }

    async _savePoints(graphIndex, points) {
        // Use staged changes instead
        this._stageChange(graphIndex, 'points', points);
    }

    async _toggleSchedulerEnabled() {
        if (!this._scheduler || !this._hass) return;

        try {
            // Toggle the switch entity - use the entity from config
            const switchEntity = this._config.entity;
            await this._hass.callService('switch', this._scheduler.enabled ? 'turn_off' : 'turn_on', {
                entity_id: switchEntity
            });

            // Reload data after toggle
            setTimeout(() => this._loadSchedulerData(), 500);
        } catch (e) {
            console.error('Failed to toggle scheduler:', e);
        }
    }

    async _applyNow() {
        if (!this._scheduler) return;

        try {
            await this._hass.callService('universal_scheduler', 'apply_now', {
                entity_id: this._scheduler.entityId
            });
        } catch (e) {
            console.error('Failed to apply now:', e);
        }
    }

    _renderGraph() {
        const graphContainer = this.shadowRoot.querySelector('[data-graph]');
        if (!graphContainer) return;

        const graph = this._getDisplayGraph();
        if (!graph) return;

        this._renderGraphWithPoints(graph, graph.points);
    }

    _renderGraphWithPoints(graph, points) {
        const graphContainer = this.shadowRoot.querySelector('[data-graph]');
        if (!graphContainer || !graph) return;

        const svg = graphContainer.querySelector('.curve-svg');
        const curvePath = svg.querySelector('.curve-line');
        const fillPath = svg.querySelector('.fill-area');

        // Clear existing points
        graphContainer.querySelectorAll('.point').forEach(el => el.remove());

        const isEntityBased = graph.xAxisType === 'entity';
        const xMin = isEntityBased ? (graph.xAxisMin ?? 0) : 0;
        const xMax = isEntityBased ? (graph.xAxisMax ?? 100) : 1440;
        const yRange = graph.maxY - graph.minY;
        const xRange = xMax - xMin;

        // Create a temporary graph object with the provided points for interpolation
        const tempGraph = { ...graph, points: points };

        // Generate path
        const pathPoints = this._generateInterpolatedPath(tempGraph, xMin, xMax);

        if (pathPoints.length === 0) {
            curvePath.setAttribute('d', '');
            fillPath.setAttribute('d', '');
            return;
        }

        // Build SVG path
        let d = '';
        pathPoints.forEach((p, i) => {
            const x = ((p.x - xMin) / xRange) * 100;
            const y = 100 - ((p.y - graph.minY) / yRange) * 100;
            d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        });

        curvePath.setAttribute('d', d);

        // Fill area
        const firstX = ((pathPoints[0].x - xMin) / xRange) * 100;
        const lastX = ((pathPoints[pathPoints.length - 1].x - xMin) / xRange) * 100;
        fillPath.setAttribute('d', d + ` L ${lastX} 100 L ${firstX} 100 Z`);

        // Render points
        if (this._config.allow_edit !== false) {
            (points || []).forEach((point, index) => {
                const xPercent = ((point.x - xMin) / xRange) * 100;
                const yPercent = 100 - ((point.y - graph.minY) / yRange) * 100;

                const pointEl = document.createElement('div');
                pointEl.className = 'point';
                pointEl.dataset.index = index;
                pointEl.style.left = `${xPercent}%`;
                pointEl.style.top = `${yPercent}%`;
                pointEl.title = isEntityBased ?
                    `${point.x}: ${point.y}` :
                    `${this._minutesToTime(point.x)}: ${point.y}`;

                graphContainer.appendChild(pointEl);
            });
        }
    }

    _generateInterpolatedPath(graph, startX, endX) {
        const points = graph.points || [];
        if (points.length === 0) return [];

        const mode = graph.mode || 'linear';
        const stepToZero = graph.stepToZero || false;
        const result = [];
        const step = (endX - startX) / 200;

        // Sort points
        const sortedPoints = [...points].sort((a, b) => a.x - b.x);

        for (let x = startX; x <= endX; x += step) {
            const y = this._interpolateValue(sortedPoints, x, mode, stepToZero, graph.minY);
            result.push({ x, y });
        }

        return result;
    }

    _interpolateValue(points, x, mode, stepToZero, minY) {
        if (points.length === 0) return 0;
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

        if (x <= points[0].x) return points[0].y;
        if (x >= points[points.length - 1].x) return points[points.length - 1].y;

        const range = p2.x - p1.x;
        if (range === 0) return p1.y;

        const t = (x - p1.x) / range;

        switch (mode) {
            case 'step':
                if (stepToZero && p2.y === minY) {
                    return x >= p2.x ? minY : p1.y;
                }
                return x >= p2.x ? p2.y : p1.y;
            case 'smooth':
                const smoothT = (1 - Math.cos(t * Math.PI)) / 2;
                return p1.y + (p2.y - p1.y) * smoothT;
            case 'linear':
            default:
                return p1.y + (p2.y - p1.y) * t;
        }
    }

    _updateTimeMarker() {
        const marker = this.shadowRoot.querySelector('[data-time-marker]');
        if (!marker) return;

        const graph = this._getDisplayGraph();
        if (!graph || graph.xAxisType === 'entity') {
            marker.style.display = 'none';
            return;
        }

        const now = new Date();
        const currentMinute = now.getHours() * 60 + now.getMinutes();
        const percent = (currentMinute / 1440) * 100;

        marker.style.display = 'block';
        marker.style.left = `${percent}%`;
    }

    _updateCurrentValue() {
        const currentEl = this.shadowRoot.querySelector('[data-current-value]');
        const nextEl = this.shadowRoot.querySelector('[data-next-value]');
        if (!currentEl || !nextEl) return;

        const graph = this._getDisplayGraph();
        if (!graph) {
            currentEl.textContent = '--';
            nextEl.textContent = '--';
            return;
        }

        const isEntityBased = graph.xAxisType === 'entity';
        let currentX;

        if (isEntityBased) {
            // Get current value from X-axis entity
            const xEntityState = this._hass?.states?.[graph.xAxisEntity];
            currentX = parseFloat(xEntityState?.state) || 0;
        } else {
            const now = new Date();
            currentX = now.getHours() * 60 + now.getMinutes();
        }

        const currentValue = this._interpolateValue(
            graph.points,
            currentX,
            graph.mode,
            graph.stepToZero,
            graph.minY
        );

        currentEl.textContent = `${currentValue.toFixed(1)} ${graph.unit || ''}`;

        // Calculate next change
        const sortedPoints = [...graph.points].sort((a, b) => a.x - b.x);
        let nextPoint = null;

        for (const p of sortedPoints) {
            if (p.x > currentX) {
                nextPoint = p;
                break;
            }
        }

        if (nextPoint) {
            if (isEntityBased) {
                nextEl.textContent = `${nextPoint.y.toFixed(1)} @ ${nextPoint.x}${graph.xAxisUnit || ''}`;
            } else {
                nextEl.textContent = `${nextPoint.y.toFixed(1)} @ ${this._minutesToTime(nextPoint.x)}`;
            }
        } else if (sortedPoints.length > 0) {
            // Wrap to first point (next day)
            const firstPoint = sortedPoints[0];
            if (isEntityBased) {
                nextEl.textContent = `${firstPoint.y.toFixed(1)} @ ${firstPoint.x}${graph.xAxisUnit || ''}`;
            } else {
                nextEl.textContent = `${firstPoint.y.toFixed(1)} @ ${this._minutesToTime(firstPoint.x)} (tomorrow)`;
            }
        } else {
            nextEl.textContent = '--';
        }
    }

    disconnectedCallback() {
        if (this._timeUpdateInterval) {
            clearInterval(this._timeUpdateInterval);
        }
    }

    getCardSize() {
        return 4;
    }
}

// Register the card and editor
customElements.define('universal-scheduler-card-editor', UniversalSchedulerCardEditor);
customElements.define('universal-scheduler-card', UniversalSchedulerCard);

// Register with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'universal-scheduler-card',
    name: 'Universal Scheduler Card',
    description: 'Display and edit scheduler graphs',
    preview: true,
    documentationURL: 'https://github.com/your-repo/universal-scheduler'
});

console.log('%c UNIVERSAL-SCHEDULER-CARD %c loaded ', 'background: #4caf50; color: white; font-weight: bold;', 'background: #ddd; color: #333;');
