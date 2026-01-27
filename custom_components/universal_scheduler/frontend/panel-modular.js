/**
 * Universal Scheduler Panel
 * Multi-entity scheduler with curve interpolation
 *
 * Modular version - imports from separate files
 */

import { PANEL_STYLES } from './styles.js';
import { PANEL_TEMPLATE, createSchedulerCardHTML } from './templates.js';
import {
    getEntityInfo as getEntityInfoUtil,
    getControllableEntities,
    minutesToTime,
    timeToMinutes,
    getDomainIcon,
    interpolateValue,
    parsePoints,
    CONTROLLABLE_DOMAINS,
    getNumericAttributes
} from './utils.js';
import { GraphHandler } from './graph.js';
import {
    applySchedulerNow as applySchedulerNowAPI,
    saveScheduler as saveSchedulerAPI,
    deleteScheduler as deleteSchedulerAPI,
    loadSchedulersFromHA as loadSchedulersFromHAAPI,
    loadSchedulersFromEntities as loadSchedulersFromEntitiesAPI
} from './services.js';
import { getAttributeUnit, getAttributeRange, isKnownAttribute } from './attribute-config.js';

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
        const oldHass = this._hass;
        this._hass = hass;
        if (!this._initialized) {
            this.init();
            this._initialized = true;
        }
        if (this._initialized && this._root && !this._hasLoadedSchedulers) {
            this._hasLoadedSchedulers = true;
            this.loadSchedulersFromHA();
        }

        // Check for entity state changes (for entity-based X-axis graphs)
        if (oldHass && hass && this._entitySubscriptions) {
            this._handleEntityStateChanges();
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

        // Global settings toggle
        this._root.querySelector('#globalSettingsToggle').addEventListener('click', () => {
            const globalSettings = this._root.querySelector('.global-settings');
            globalSettings.classList.toggle('collapsed');
            this._saveGlobalSettings();
        });

        // Global snap select
        this._root.querySelector('#globalSnapSelect').addEventListener('change', (e) => {
            this.globalSnapMinutes = parseFloat(e.target.value);
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
            this.closeSettingsModal();
        });

        this._root.querySelector('#settingsModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeSettingsModal();
            }
        });

        // Settings modal - Update Interval change
        this._root.querySelector('#settingsUpdateInterval').addEventListener('change', (e) => {
            if (this._settingsModalEntityId) {
                this.saveUndoState(this._settingsModalEntityId);
                this.schedulers[this._settingsModalEntityId].updateInterval = parseInt(e.target.value);
            }
        });

        // Settings modal - Graphs per Row change
        this._root.querySelector('#settingsGraphsPerRow').addEventListener('change', (e) => {
            if (this._settingsModalEntityId) {
                this.saveUndoState(this._settingsModalEntityId);
                const value = parseInt(e.target.value);
                this.schedulers[this._settingsModalEntityId].graphsPerRow = value;
                // Update the card's graphs container
                const card = this._root.querySelector(`[data-entity="${this._settingsModalEntityId}"]`);
                if (card) {
                    card.querySelector('.graphs-container')?.style.setProperty('--graphs-per-row', value);
                }
            }
        });

        // Settings modal - Override Behavior change
        this._root.querySelector('#settingsOverrideBehavior').addEventListener('change', (e) => {
            if (this._settingsModalEntityId) {
                this.saveUndoState(this._settingsModalEntityId);
                this.schedulers[this._settingsModalEntityId].overrideBehavior = e.target.value;
                // Show/hide duration input
                const durationGroup = this._root.querySelector('#overrideDurationGroup');
                durationGroup.style.display = e.target.value === 'for_duration' ? 'block' : 'none';
            }
        });

        // Settings modal - Override Duration change
        this._root.querySelector('#settingsOverrideDuration').addEventListener('change', (e) => {
            if (this._settingsModalEntityId) {
                this.saveUndoState(this._settingsModalEntityId);
                const seconds = this._parseDurationToSeconds(e.target.value);
                this.schedulers[this._settingsModalEntityId].overrideDuration = seconds;
                // Format back to readable format
                e.target.value = this._formatSecondsToDuration(seconds);
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

    openSettingsModal(entityId) {
        const scheduler = this.schedulers[entityId];
        if (!scheduler) return;

        this._settingsModalEntityId = entityId;

        // Populate modal with current values
        const updateIntervalSelect = this._root.querySelector('#settingsUpdateInterval');
        const graphsPerRowSelect = this._root.querySelector('#settingsGraphsPerRow');
        const overrideBehaviorSelect = this._root.querySelector('#settingsOverrideBehavior');
        const overrideDurationInput = this._root.querySelector('#settingsOverrideDuration');
        const overrideDurationGroup = this._root.querySelector('#overrideDurationGroup');

        updateIntervalSelect.value = (scheduler.updateInterval || 300).toString();
        graphsPerRowSelect.value = (scheduler.graphsPerRow || 1).toString();
        overrideBehaviorSelect.value = scheduler.overrideBehavior || 'none';
        overrideDurationInput.value = this._formatSecondsToDuration(scheduler.overrideDuration || 3600);

        // Show/hide duration input based on behavior
        overrideDurationGroup.style.display = overrideBehaviorSelect.value === 'for_duration' ? 'block' : 'none';

        // Update modal title to show which scheduler
        const modalTitle = this._root.querySelector('#settingsModal h3');
        if (modalTitle) {
            modalTitle.textContent = `Settings: ${scheduler.name}`;
        }

        this._root.querySelector('#settingsModal').classList.add('show');
    }

    closeSettingsModal() {
        this._root.querySelector('#settingsModal').classList.remove('show');
        this._settingsModalEntityId = null;
    }

    _parseDurationToSeconds(durationStr) {
        /**
         * Parse duration string in DD:HH:MM:SS format to total seconds.
         * Also accepts partial formats like HH:MM:SS, MM:SS, or just SS.
         */
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
        /**
         * Format total seconds to DD:HH:MM:SS string.
         */
        if (!totalSeconds || totalSeconds < 0) totalSeconds = 0;

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [
            days.toString().padStart(2, '0'),
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
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
        console.log(`Scheduler created: ${this.schedulers[entityId].entityId} (${this.schedulers[entityId].domain})`);
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
            this.openSettingsModal(entityId);
        });

        // Delete button
        card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete scheduler for ${entityId}?`)) {
                this.deleteScheduler(entityId);
            }
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

        // Toggle graph settings collapse
        section.querySelector('[data-action="toggleGraphSettings"]')?.addEventListener('click', (e) => {
            const wrapper = section.querySelector('.graph-settings-wrapper');
            if (wrapper) {
                wrapper.classList.toggle('collapsed');
            }
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

        // X-axis type change handler
        section.querySelector('[data-graph-setting="xAxisType"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            const graph = getGraph();
            const prevType = graph.xAxisType;
            graph.xAxisType = e.target.value;

            // When switching X-axis types, reset points to default range
            // This prevents having points at x=1440 when switching to entity-based (0-100)
            if (prevType !== graph.xAxisType) {
                const isNowEntityBased = graph.xAxisType === 'entity';
                const xMin = isNowEntityBased ? (graph.xAxisMin ?? 0) : 0;
                const xMax = isNowEntityBased ? (graph.xAxisMax ?? 100) : 1440;

                // Reset points to span the new X range
                graph.points = [
                    { x: xMin, y: graph.minY },
                    { x: xMax, y: graph.maxY }
                ];

                // Reset zoom when switching modes
                graph.zoomLevel = 1;
                graph.zoomOffset = 0;
            }

            // Show/hide entity-based X-axis settings
            const showEntity = graph.xAxisType === 'entity';
            section.querySelector('.x-axis-entity-group').style.display = showEntity ? 'flex' : 'none';
            section.querySelector('.x-axis-min-group').style.display = showEntity ? 'flex' : 'none';
            section.querySelector('.x-axis-max-group').style.display = showEntity ? 'flex' : 'none';
            section.querySelector('.x-axis-unit-group').style.display = showEntity ? 'flex' : 'none';

            // Toggle add-point input visibility
            const timeInput = section.querySelector('[data-new-point-time]');
            const xInput = section.querySelector('[data-new-point-x]');
            if (timeInput) timeInput.style.display = showEntity ? 'none' : 'inline-block';
            if (xInput) xInput.style.display = showEntity ? 'inline-block' : 'none';

            // Re-render the graph with appropriate axis
            this.updateGraphSection(entityId, graphIndex, section);

            // Re-render the points list with correct input types
            this.graphHandler.renderPointsListMulti(entityId, graphIndex, section);

            // Subscribe to entity state changes if entity-based
            if (showEntity && graph.xAxisEntity) {
                this._subscribeToEntityChanges(entityId, graphIndex, section, graph.xAxisEntity);
            }
        });

        // X-axis entity autocomplete setup
        const xEntityInput = section.querySelector('[data-graph-setting="xAxisEntity"]');
        const xEntityAutocomplete = section.querySelector('.x-entity-autocomplete-list');

        if (xEntityInput && xEntityAutocomplete) {
            xEntityInput.addEventListener('input', (e) => {
                const value = e.target.value.toLowerCase();
                // Get all sensor/input_number entities for X-axis
                const allEntities = Object.keys(this._hass?.states || {})
                    .filter(id => {
                        const domain = id.split('.')[0];
                        return ['sensor', 'input_number', 'number', 'counter'].includes(domain);
                    })
                    .sort();

                const matches = allEntities.filter(id =>
                    id.toLowerCase().includes(value) ||
                    (this._hass?.states[id]?.attributes?.friendly_name || '').toLowerCase().includes(value)
                ).slice(0, 10);

                if (value && matches.length > 0) {
                    xEntityAutocomplete.innerHTML = matches.map(id => {
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
                    xEntityAutocomplete.classList.add('show');
                } else {
                    xEntityAutocomplete.classList.remove('show');
                }
            });

            xEntityAutocomplete.addEventListener('click', (e) => {
                const item = e.target.closest('.autocomplete-item');
                if (item) {
                    const selectedEntityId = item.dataset.entity;
                    xEntityInput.value = selectedEntityId;
                    xEntityAutocomplete.classList.remove('show');
                    // Trigger the change event to apply the entity
                    xEntityInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            // Close autocomplete when clicking outside
            xEntityInput.addEventListener('blur', () => {
                // Delay to allow click on autocomplete item
                setTimeout(() => {
                    xEntityAutocomplete.classList.remove('show');
                }, 200);
            });
        }

        // X-axis entity input handler (change event)
        section.querySelector('[data-graph-setting="xAxisEntity"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            const graph = getGraph();
            graph.xAxisEntity = e.target.value || null;

            // Try to auto-detect min/max from entity attributes
            let boundsChanged = false;
            if (graph.xAxisEntity && this._hass?.states[graph.xAxisEntity]) {
                const entityState = this._hass.states[graph.xAxisEntity];
                const attrs = entityState.attributes || {};

                // Auto-fill min/max if available
                if (attrs.min !== undefined && graph.xAxisMin !== attrs.min) {
                    graph.xAxisMin = attrs.min;
                    section.querySelector('[data-graph-setting="xAxisMin"]').value = attrs.min;
                    boundsChanged = true;
                }
                if (attrs.max !== undefined && graph.xAxisMax !== attrs.max) {
                    graph.xAxisMax = attrs.max;
                    section.querySelector('[data-graph-setting="xAxisMax"]').value = attrs.max;
                    boundsChanged = true;
                }
                if (attrs.unit_of_measurement) {
                    graph.xAxisUnit = attrs.unit_of_measurement;
                    section.querySelector('[data-graph-setting="xAxisUnit"]').value = attrs.unit_of_measurement;
                }
            }

            // Reset points to new range when bounds change from entity detection
            if (boundsChanged) {
                const xMin = graph.xAxisMin ?? 0;
                const xMax = graph.xAxisMax ?? 100;
                graph.points = [
                    { x: xMin, y: graph.minY },
                    { x: xMax, y: graph.maxY }
                ];
                graph.zoomLevel = 1;
                graph.zoomOffset = 0;
                this.graphHandler.renderPointsListMulti(entityId, graphIndex, section);
            }

            this.updateGraphSection(entityId, graphIndex, section);

            // Subscribe to entity state changes
            if (graph.xAxisEntity) {
                this._subscribeToEntityChanges(entityId, graphIndex, section, graph.xAxisEntity);
            }
        });

        // X-axis min/max/unit handlers
        section.querySelector('[data-graph-setting="xAxisMin"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            const graph = getGraph();
            const newMin = parseFloat(e.target.value);
            const xMax = graph.xAxisMax ?? 100;

            // Clip existing points to new range
            graph.points = graph.points.map(p => ({
                x: Math.max(newMin, Math.min(xMax, p.x)),
                y: p.y
            }));

            graph.xAxisMin = newMin;

            // Reset zoom when bounds change
            graph.zoomLevel = 1;
            graph.zoomOffset = 0;

            this.updateGraphSection(entityId, graphIndex, section);
            this.graphHandler.renderPointsListMulti(entityId, graphIndex, section);
        });

        section.querySelector('[data-graph-setting="xAxisMax"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            const graph = getGraph();
            const xMin = graph.xAxisMin ?? 0;
            const newMax = parseFloat(e.target.value);

            // Clip existing points to new range
            graph.points = graph.points.map(p => ({
                x: Math.max(xMin, Math.min(newMax, p.x)),
                y: p.y
            }));

            graph.xAxisMax = newMax;

            // Reset zoom when bounds change
            graph.zoomLevel = 1;
            graph.zoomOffset = 0;

            this.updateGraphSection(entityId, graphIndex, section);
            this.graphHandler.renderPointsListMulti(entityId, graphIndex, section);
        });

        section.querySelector('[data-graph-setting="xAxisUnit"]')?.addEventListener('change', (e) => {
            this.saveUndoState(entityId);
            getGraph().xAxisUnit = e.target.value || '';
            this.updateGraphSection(entityId, graphIndex, section);
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

                // Handle entity-based X-axis point editing
                if (e.target.matches('[data-point-x]')) {
                    const xValue = parseFloat(e.target.value);
                    const xMin = graph.xAxisMin ?? 0;
                    const xMax = graph.xAxisMax ?? 100;
                    const xTolerance = (xMax - xMin) * 0.005;

                    if (!isNaN(xValue) && xValue >= xMin && xValue <= xMax) {
                        const hasConflict = graph.points.some((p, i) => i !== pointIndex && Math.abs(p.x - xValue) < xTolerance);
                        if (!hasConflict) {
                            this.saveUndoState(entityId);
                            graph.points[pointIndex].x = xValue;
                            this.graphHandler.renderGraphSection(entityId, graphIndex, section);
                        } else {
                            e.target.value = graph.points[pointIndex].x.toFixed(2);
                        }
                    } else {
                        e.target.value = graph.points[pointIndex].x.toFixed(2);
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
            const isEntityBased = graph.xAxisType === 'entity';

            let xValue;
            let xTolerance;

            if (isEntityBased) {
                // Entity-based X-axis
                const xInput = section.querySelector('[data-new-point-x]');
                xValue = parseFloat(xInput?.value);
                const xMin = graph.xAxisMin ?? 0;
                const xMax = graph.xAxisMax ?? 100;
                xTolerance = (xMax - xMin) * 0.005;

                if (isNaN(xValue) || xValue < xMin || xValue > xMax) {
                    alert(`Invalid X value. Must be between ${xMin} and ${xMax}`);
                    return;
                }
            } else {
                // Time-based X-axis
                const timeInput = section.querySelector('[data-new-point-time]');
                xValue = timeToMinutes(timeInput?.value);
                xTolerance = 1;

                if (xValue === null || xValue < 0 || xValue > 1440) {
                    alert('Invalid time format. Use HH:MM (e.g., 14:30)');
                    return;
                }
            }

            const valueInput = section.querySelector('[data-new-point-value]');
            let yValue = parseFloat(valueInput?.value);

            if (isNaN(yValue)) {
                alert('Invalid value');
                return;
            }

            yValue = Math.max(graph.minY, Math.min(graph.maxY, yValue));
            this.saveUndoState(entityId);

            const existingIndex = graph.points.findIndex(p => Math.abs(p.x - xValue) < xTolerance);
            if (existingIndex !== -1) {
                graph.points[existingIndex].y = yValue;
            } else {
                graph.points.push({ x: xValue, y: yValue });
            }

            // Clear inputs
            if (isEntityBased) {
                const xInput = section.querySelector('[data-new-point-x]');
                if (xInput) xInput.value = '';
            } else {
                const timeInput = section.querySelector('[data-new-point-time]');
                if (timeInput) timeInput.value = '';
            }
            if (valueInput) valueInput.value = '';

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
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;

        const graph = scheduler.graphs[graphIndex];
        if (!graph) return;

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
    _cloneGraphs(scheduler) {
        const graphs = Array.isArray(scheduler?.graphs) ? scheduler.graphs : [];
        if (typeof structuredClone === 'function') {
            return structuredClone(graphs);
        }
        return JSON.parse(JSON.stringify(graphs));
    }

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
            graphs: this._cloneGraphs(scheduler)
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
            graphs: this._cloneGraphs(scheduler)
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
            graphs: this._cloneGraphs(scheduler)
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
            const globalSettings = this._root.querySelector('.global-settings');
            const settings = {
                globalSnapMinutes: this.globalSnapMinutes,
                graphDisplayMode: this.graphDisplayMode,
                itemsPerPage: this.itemsPerPage,
                columnsCount: this.columnsCount,
                graphHeight: this.graphHeight,
                globalSettingsCollapsed: globalSettings?.classList.contains('collapsed') ?? true
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
                // Restore collapsed state (default to collapsed)
                this._globalSettingsCollapsed = settings.globalSettingsCollapsed ?? true;

                console.log('Restored global settings');
            } else {
                // Default to collapsed if no settings stored
                this._globalSettingsCollapsed = true;
            }
        } catch (e) {
            console.warn('Failed to restore global settings:', e);
            this._globalSettingsCollapsed = true;
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

        // Apply global settings collapsed state
        const globalSettings = this._root.querySelector('.global-settings');
        if (globalSettings) {
            if (this._globalSettingsCollapsed) {
                globalSettings.classList.add('collapsed');
            } else {
                globalSettings.classList.remove('collapsed');
            }
        }

        const graphHeight = this._root.querySelector('#graphHeight');
        if (graphHeight) {
            graphHeight.value = this.graphHeight.toString();
        }
    }

    // ============ Entity State Change Subscription ============

    /**
     * Subscribe to entity state changes for entity-based X-axis graphs
     * When the X-axis entity changes, immediately update the graph and apply the value
     */
    _subscribeToEntityChanges(schedulerEntityId, graphIndex, section, xAxisEntity) {
        if (!this._hass || !xAxisEntity) return;

        // Create subscription key
        const subKey = `${schedulerEntityId}_${graphIndex}_${xAxisEntity}`;

        // Initialize subscriptions map if not exists
        if (!this._entitySubscriptions) {
            this._entitySubscriptions = new Map();
        }

        // Avoid duplicate subscriptions
        if (this._entitySubscriptions.has(subKey)) {
            return;
        }

        // Store subscription info
        this._entitySubscriptions.set(subKey, {
            schedulerEntityId,
            graphIndex,
            xAxisEntity,
            lastValue: null
        });

        console.log(`Subscribed to entity changes: ${xAxisEntity} for graph ${graphIndex} of ${schedulerEntityId}`);
    }

    /**
     * Handle entity state changes (called when hass object is updated)
     * This is called periodically when Home Assistant state changes
     */
    _handleEntityStateChanges() {
        if (!this._entitySubscriptions || !this._hass) return;

        this._entitySubscriptions.forEach((sub, key) => {
            const entityState = this._hass.states?.[sub.xAxisEntity];
            if (!entityState) return;

            const currentValue = parseFloat(entityState.state);
            if (isNaN(currentValue)) return;

            // Check if value changed
            if (sub.lastValue !== null && Math.abs(currentValue - sub.lastValue) > 0.001) {
                // Value changed - update the graph and potentially apply
                const scheduler = this.schedulers[sub.schedulerEntityId];
                if (scheduler && scheduler.graphs?.[sub.graphIndex]) {
                    const graph = scheduler.graphs[sub.graphIndex];

                    // Only process if this is an entity-based graph
                    if (graph.xAxisType === 'entity' && graph.xAxisEntity === sub.xAxisEntity) {
                        const section = this._root.querySelector(
                            `[data-entity="${sub.schedulerEntityId}"] [data-graph-index="${sub.graphIndex}"]`
                        );

                        if (section && !section.classList.contains('collapsed')) {
                            // Update the graph display
                            this.graphHandler.updateCurrentTimeMarkerMulti(section, graph, this._hass);
                            this.graphHandler.updateCurrentValueMulti(sub.schedulerEntityId, sub.graphIndex, section);
                        }

                        // Apply the scheduler value if enabled
                        if (scheduler.enabled) {
                            this._applyEntityBasedScheduler(sub.schedulerEntityId, sub.graphIndex, currentValue);
                        }
                    }
                }
            }

            // Update last known value
            sub.lastValue = currentValue;
        });
    }

    /**
     * Apply scheduler value for entity-based X-axis when the X entity changes
     */
    async _applyEntityBasedScheduler(schedulerEntityId, graphIndex, xValue) {
        const scheduler = this.schedulers[schedulerEntityId];
        if (!scheduler || !scheduler.enabled) return;

        const graph = scheduler.graphs?.[graphIndex];
        if (!graph || graph.xAxisType !== 'entity') return;

        const { interpolateValue, interpolateValueWithStepToMin } = await import('./utils.js');

        // Clamp X value to bounds
        const xMin = graph.xAxisMin ?? 0;
        const xMax = graph.xAxisMax ?? 100;
        const clampedX = Math.max(xMin, Math.min(xMax, xValue));

        // Get interpolated Y value at current X position
        const yValue = graph.stepToZero
            ? interpolateValueWithStepToMin(clampedX, graph.points, graph.mode, graph.minY, graph.maxY)
            : interpolateValue(clampedX, graph.points, graph.mode, graph.minY, graph.maxY);

        console.log(`Entity-based apply: X=${clampedX} -> Y=${yValue} for ${schedulerEntityId}`);

        // Apply value directly to the target entity
        await this._applyValueDirectly(scheduler, graph, yValue);
    }

    /**
     * Directly apply a value to the target entity (fallback)
     */
    async _applyValueDirectly(scheduler, graph, value) {
        const targetEntity = scheduler.entityId;
        const domain = scheduler.domain;

        try {
            switch (domain) {
                case 'light':
                    if (value > 0) {
                        await this._hass.callService('light', 'turn_on', {
                            entity_id: targetEntity,
                            brightness: Math.round((value / 100) * 255),
                            transition: 2
                        });
                    } else {
                        await this._hass.callService('light', 'turn_off', {
                            entity_id: targetEntity,
                            transition: 2
                        });
                    }
                    break;
                case 'climate':
                    await this._hass.callService('climate', 'set_temperature', {
                        entity_id: targetEntity,
                        temperature: Math.round(value * 10) / 10
                    });
                    break;
                case 'fan':
                    if (value > 0) {
                        await this._hass.callService('fan', 'set_percentage', {
                            entity_id: targetEntity,
                            percentage: Math.round(value)
                        });
                    } else {
                        await this._hass.callService('fan', 'turn_off', {
                            entity_id: targetEntity
                        });
                    }
                    break;
                case 'cover':
                    await this._hass.callService('cover', 'set_cover_position', {
                        entity_id: targetEntity,
                        position: Math.round(value)
                    });
                    break;
                case 'input_number':
                case 'number':
                    await this._hass.callService('input_number', 'set_value', {
                        entity_id: targetEntity,
                        value: Math.round(value * 100) / 100
                    });
                    break;
                default:
                    console.warn('Unknown domain for apply:', domain);
            }
        } catch (err) {
            console.error('Failed to apply value directly:', err);
        }
    }
}

customElements.define('universal-curve-scheduler', UniversalSchedulerPanel);
console.log('UniversalSchedulerPanel v3 (modular) loaded');
