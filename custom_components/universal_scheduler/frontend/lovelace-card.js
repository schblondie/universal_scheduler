/**
 * Universal Scheduler - Lovelace Card
 * A card to display and edit scheduler graphs in Lovelace dashboards
 */

import { PANEL_STYLES } from './styles.js';
import { interpolateValue, interpolateValueWithStepToMin, generateInterpolatedPath, minutesToTime, clamp, getEntityInfo as getEntityInfoUtil, getDomainIcon } from './utils.js';

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

    .scheduler-card-header .state {
        font-size: 0.9rem;
        opacity: 0.7;
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
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }

    .card-graph-wrapper {
        position: relative;
        display: flex;
        height: var(--graph-height, 200px);
        margin-bottom: 10px;
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
        background: var(--secondary-background-color);
        border-radius: 8px;
        overflow: hidden;
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
            linear-gradient(to right, var(--divider-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--divider-color) 1px, transparent 1px);
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
        stroke: var(--primary-color);
        stroke-width: 2;
    }

    .fill-area {
        fill: rgba(var(--rgb-primary-color), 0.15);
        stroke: none;
    }

    .point {
        position: absolute;
        width: 14px;
        height: 14px;
        background: var(--primary-color);
        border: 2px solid var(--card-background-color);
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

    .current-time-marker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--error-color, #f44336);
        z-index: 5;
        pointer-events: none;
    }

    .current-time-marker::before {
        content: '';
        position: absolute;
        top: 0;
        left: -4px;
        width: 10px;
        height: 10px;
        background: var(--error-color, #f44336);
        border-radius: 50%;
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
        color: var(--primary-color);
    }

    .current-value-row button {
        margin-left: auto;
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

    .current-value-row button:hover {
        background: var(--primary-color);
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
        opacity: 0.6;
    }

    .no-scheduler ha-icon {
        font-size: 48px;
        margin-bottom: 10px;
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
    }

    set hass(hass) {
        this._hass = hass;
        this._loadSchedulers();
    }

    setConfig(config) {
        this._config = config;
        this._render();
    }

    async _loadSchedulers() {
        if (!this._hass) return;

        try {
            // Load schedulers from WebSocket API
            const result = await this._hass.callWS({
                type: 'universal_scheduler/get_schedulers'
            });

            const schedulers = result.schedulers || {};
            this._schedulers = Object.entries(schedulers).map(([entityId, data]) => ({
                entityId: entityId,
                switchEntity: `switch.universal_scheduler_${entityId.replace(/\./g, '_')}`,
                name: data.name || entityId,
                domain: data.domain || entityId.split('.')[0]
            }));

            this._filteredSchedulers = [...this._schedulers];
            this._render();
        } catch (e) {
            console.error('Failed to load schedulers:', e);
            // Fallback: try to find from switch entities
            this._schedulers = Object.keys(this._hass.states)
                .filter(id => id.startsWith('switch.universal_scheduler_'))
                .map(id => {
                    const state = this._hass.states[id];
                    return {
                        entityId: id.replace('switch.universal_scheduler_', '').replace(/_/g, '.'),
                        switchEntity: id,
                        name: state?.attributes?.friendly_name || id,
                        domain: 'unknown'
                    };
                });
            this._filteredSchedulers = [...this._schedulers];
            this._render();
        }
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
                .no-results {
                    padding: 12px;
                    text-align: center;
                    opacity: 0.6;
                    font-size: 0.9rem;
                }
            </style>

            <div class="editor-row">
                <label>Scheduler Entity</label>
                <div class="autocomplete-wrapper">
                    <input type="text" id="entity-search" value="${currentValue}" placeholder="Search schedulers..." autocomplete="off">
                    <div class="autocomplete-list" id="autocomplete-list">
                        ${this._renderAutocompleteItems()}
                    </div>
                </div>
                <span class="hint">Search and select which scheduler to display</span>
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
                <input type="checkbox" id="show_graph_settings" ${this._config.show_graph_settings ? 'checked' : ''}>
                <label for="show_graph_settings">Show graph settings (when not editing)</label>
            </div>

            <div class="editor-checkbox">
                <input type="checkbox" id="show_points_editor" ${this._config.show_points_editor ? 'checked' : ''}>
                <label for="show_points_editor">Show points editor</label>
            </div>

            <div class="editor-checkbox">
                <input type="checkbox" id="show_weekdays" ${this._config.show_weekdays !== false ? 'checked' : ''}>
                <label for="show_weekdays">Show weekday selector</label>
            </div>

            <div class="editor-checkbox">
                <input type="checkbox" id="show_current_value" ${this._config.show_current_value !== false ? 'checked' : ''}>
                <label for="show_current_value">Show current value display</label>
            </div>

            <div class="editor-checkbox">
                <input type="checkbox" id="allow_edit" ${this._config.allow_edit !== false ? 'checked' : ''}>
                <label for="allow_edit">Allow editing points</label>
            </div>
        `;

        // Setup event listeners
        this._setupEventListeners();
    }

    _renderAutocompleteItems() {
        if (this._filteredSchedulers.length === 0) {
            return '<div class="no-results">No schedulers found</div>';
        }

        return this._filteredSchedulers.map(scheduler => `
            <div class="autocomplete-item" data-entity="${scheduler.switchEntity}">
                <ha-icon icon="${this._getDomainIcon(scheduler.domain)}"></ha-icon>
                <span class="item-name">${scheduler.name}</span>
                <span class="item-entity">${scheduler.entityId}</span>
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
                const entity = item.dataset.entity;
                const scheduler = this._schedulers.find(s => s.switchEntity === entity);
                if (scheduler) {
                    searchInput.value = scheduler.name;
                    this._valueChanged('entity', scheduler.switchEntity);
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
        this.querySelector('#show_graph_settings').addEventListener('change', (e) => this._valueChanged('show_graph_settings', e.target.checked));
        this.querySelector('#show_points_editor').addEventListener('change', (e) => this._valueChanged('show_points_editor', e.target.checked));
        this.querySelector('#show_weekdays').addEventListener('change', (e) => this._valueChanged('show_weekdays', e.target.checked));
        this.querySelector('#show_current_value').addEventListener('change', (e) => this._valueChanged('show_current_value', e.target.checked));
        this.querySelector('#allow_edit').addEventListener('change', (e) => this._valueChanged('allow_edit', e.target.checked));
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
            this._render();
            return;
        }

        try {
            // Load scheduler data from websocket
            const result = await this._hass.callWS({
                type: 'universal_scheduler/get_schedulers'
            });

            // Find the scheduler for our entity
            const targetEntity = this._config.entity.replace('switch.universal_scheduler_', '').replace(/_/g, '.');

            const schedulers = result.schedulers || {};

            // Try to find by entity ID
            let scheduler = null;
            for (const [entityId, data] of Object.entries(schedulers)) {
                if (entityId === targetEntity ||
                    `switch.universal_scheduler_${entityId.replace(/\./g, '_')}` === this._config.entity) {
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

        return {
            entityId: entityId,
            name: data.name || entityId,
            domain: data.domain || info.domain,
            unit: info.unit,
            enabled: data.enabled !== false,
            updateInterval: data.update_interval ?? 300,
            graphsPerRow: data.graphs_per_row || 1,
            graphs: graphs
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
            return `
                <div class="no-scheduler">
                    <ha-icon icon="mdi:calendar-clock"></ha-icon>
                    <p>No scheduler selected</p>
                    <p style="font-size: 0.85rem;">Configure this card to select a scheduler</p>
                </div>
            `;
        }

        const graphs = this._scheduler.graphs || [];
        const graphIndex = this._config.graph_index !== undefined ?
            Math.min(this._config.graph_index, graphs.length - 1) :
            this._selectedGraphIndex;
        const graph = graphs[graphIndex] || graphs[0];

        if (!graph) {
            return `<div class="no-scheduler"><p>No graphs available</p></div>`;
        }

        const isEntityBased = graph.xAxisType === 'entity';
        const graphHeight = this._config.graph_height || 200;

        return `
            ${this._config.show_header !== false ? `
                <div class="scheduler-card-header">
                    <ha-icon class="entity-icon" icon="${this._getDomainIcon(this._scheduler.domain)}"></ha-icon>
                    <span class="title">${this._scheduler.name}</span>
                    <span class="state">${this._scheduler.enabled ? 'Active' : 'Disabled'}</span>
                </div>
            ` : ''}

            ${graphs.length > 1 && this._config.graph_index === undefined ? `
                <div class="graph-selector">
                    ${graphs.map((g, i) => `
                        <button class="graph-selector-btn ${i === graphIndex ? 'active' : ''}" data-index="${i}">
                            ${g.label}
                        </button>
                    `).join('')}
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
                    <div class="current-time-marker" data-time-marker style="display: ${isEntityBased ? 'none' : 'block'};"></div>
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
        const collapsed = !this._isEditing ? 'collapsed' : '';

        return `
            <div class="card-graph-settings-wrapper ${collapsed}">
                <div class="card-graph-settings-header" data-action="toggleSettings">
                    <ha-icon class="collapse-indicator" icon="mdi:chevron-down"></ha-icon>
                    <span>Graph Settings</span>
                </div>
                <div class="card-graph-settings-body">
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

    _setupEventListeners() {
        const container = this.shadowRoot.querySelector('.scheduler-card-container');
        if (!container) return;

        // Graph selector
        container.querySelectorAll('.graph-selector-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this._selectedGraphIndex = parseInt(btn.dataset.index);
                this._render();
            });
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
                    if (el.type === 'number' || setting === 'ySnap' || setting === 'minY' || setting === 'maxY') {
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
        const graph = this._getCurrentGraph();
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
        const newPoints = [...graph.points, { x, y }].sort((a, b) => a.x - b.x);

        this._savePoints(graphIndex, newPoints);
    }

    _startDrag(pointIndex, startEvent) {
        const graphContainer = this.shadowRoot.querySelector('[data-graph]');
        const rect = graphContainer.getBoundingClientRect();
        const graph = this._getCurrentGraph();
        if (!graph) return;

        const point = this.shadowRoot.querySelector(`.point[data-index="${pointIndex}"]`);
        if (point) point.classList.add('dragging');

        const isEntityBased = graph.xAxisType === 'entity';
        const xMin = isEntityBased ? (graph.xAxisMin ?? 0) : 0;
        const xMax = isEntityBased ? (graph.xAxisMax ?? 100) : 1440;
        const xSnap = graph.xSnap || 0;
        const ySnap = graph.ySnap || 0;

        const onMove = (e) => {
            const xRatio = (e.clientX - rect.left) / rect.width;
            const yRatio = 1 - (e.clientY - rect.top) / rect.height;

            let x = xMin + xRatio * (xMax - xMin);
            let y = graph.minY + yRatio * (graph.maxY - graph.minY);

            if (xSnap > 0) x = Math.round(x / xSnap) * xSnap;
            if (ySnap > 0) y = Math.round(y / ySnap) * ySnap;

            x = Math.max(xMin, Math.min(xMax, x));
            y = Math.max(graph.minY, Math.min(graph.maxY, y));

            // Update point position visually
            graph.points[pointIndex] = { x, y };
            this._renderGraph();
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);

            if (point) point.classList.remove('dragging');

            // Save the changes
            const graphIndex = this._getGraphIndex();
            const newPoints = [...graph.points].sort((a, b) => a.x - b.x);
            this._savePoints(graphIndex, newPoints);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    _getCurrentGraph() {
        if (!this._scheduler?.graphs) return null;
        const graphIndex = this._getGraphIndex();
        return this._scheduler.graphs[graphIndex];
    }

    _getGraphIndex() {
        if (this._config.graph_index !== undefined) {
            return Math.min(this._config.graph_index, (this._scheduler?.graphs?.length || 1) - 1);
        }
        return this._selectedGraphIndex;
    }

    async _toggleWeekday(weekday) {
        const graph = this._getCurrentGraph();
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

        await this._updateGraphProperty(graphIndex, 'weekdays', weekdays);
    }

    async _updateGraphSetting(setting, value) {
        const graphIndex = this._getGraphIndex();

        // Map frontend setting names to backend names
        const settingMap = {
            'mode': 'mode',
            'stepToZero': 'step_to_zero',
            'minY': 'min_y',
            'maxY': 'max_y',
            'ySnap': 'y_snap'
        };

        const backendSetting = settingMap[setting] || setting;
        await this._updateGraphProperty(graphIndex, backendSetting, value);
    }

    async _updatePoint(pointIndex, field, value) {
        const graph = this._getCurrentGraph();
        if (!graph) return;

        const graphIndex = this._getGraphIndex();
        const newPoints = [...graph.points];
        newPoints[pointIndex] = { ...newPoints[pointIndex], [field]: value };
        newPoints.sort((a, b) => a.x - b.x);

        await this._savePoints(graphIndex, newPoints);
    }

    async _deletePoint(pointIndex) {
        const graph = this._getCurrentGraph();
        if (!graph || graph.points.length <= 2) return;

        const graphIndex = this._getGraphIndex();
        const newPoints = graph.points.filter((_, i) => i !== pointIndex);

        await this._savePoints(graphIndex, newPoints);
    }

    async _addPoint() {
        const graph = this._getCurrentGraph();
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
        const newPoints = [...graph.points, { x, y }].sort((a, b) => a.x - b.x);

        await this._savePoints(graphIndex, newPoints);
    }

    async _updateGraphProperty(graphIndex, property, value) {
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
        if (!this._scheduler) return;

        try {
            // Get current scheduler config
            const result = await this._hass.callWS({
                type: 'universal_scheduler/get_schedulers'
            });

            const schedulers = result.schedulers || {};
            const config = schedulers[this._scheduler.entityId];

            if (!config?.graphs?.[graphIndex]) return;

            // Update points
            config.graphs[graphIndex].points = points;

            // Save back
            await this._hass.callWS({
                type: 'universal_scheduler/set_config',
                entity_id: this._scheduler.entityId,
                config: config
            });

            // Reload data
            await this._loadSchedulerData();
        } catch (e) {
            console.error('Failed to save points:', e);
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

        const graph = this._getCurrentGraph();
        if (!graph) return;

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

        // Generate path
        const pathPoints = this._generateInterpolatedPath(graph, xMin, xMax);

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
            graph.points.forEach((point, index) => {
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

        const graph = this._getCurrentGraph();
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

        const graph = this._getCurrentGraph();
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
