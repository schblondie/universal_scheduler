/**
 * Universal Scheduler - Templates Module
 * HTML templates for the scheduler panel
 */

export const PANEL_TEMPLATE = `
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

    <div class="global-settings collapsed">
        <div class="global-settings-header" id="globalSettingsToggle">
            <ha-icon class="collapse-indicator" icon="mdi:chevron-down"></ha-icon>
            <span>Global Settings</span>
        </div>
        <div class="global-settings-content">
            <div class="setting-group">
                <label>X-Snap:</label>
                <select id="globalSnapSelect">
                    <option value="0">Off</option>
                    <option value="0.1">0.1</option>
                    <option value="0.5">0.5</option>
                    <option value="1">1</option>
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
            <div class="settings-modal-content">
                <div class="form-group">
                    <label>Update Interval</label>
                    <select id="settingsUpdateInterval">
                        <option value="1">1 s</option>
                        <option value="5">5 s</option>
                        <option value="10">10 s</option>
                        <option value="30">30 s</option>
                        <option value="60">1 min</option>
                        <option value="300">5 min</option>
                        <option value="600">10 min</option>
                        <option value="900">15 min</option>
                        <option value="1800">30 min</option>
                        <option value="3600">1 hour</option>
                    </select>
                    <span class="form-hint">How often the scheduler applies values to the target entity</span>
                </div>
                <div class="form-group">
                    <label>Graphs per Row</label>
                    <select id="settingsGraphsPerRow">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                    <span class="form-hint">Number of graphs displayed side by side</span>
                </div>
                <h4 style="margin-top: 16px; margin-bottom: 8px; font-size: 0.95em; color: var(--secondary-text-color);">Manual Override Behavior</h4>
                <div class="form-group">
                    <label>When entity is changed manually</label>
                    <select id="settingsOverrideBehavior">
                        <option value="none">Ignore (keep scheduling)</option>
                        <option value="until_next">Disable until next scheduled change</option>
                        <option value="until_day_end">Disable until end of day</option>
                        <option value="for_duration">Disable for specific duration</option>
                        <option value="until_reenabled">Disable until manually re-enabled</option>
                    </select>
                    <span class="form-hint">How the scheduler responds when the entity is changed by user or other integrations</span>
                </div>
                <div class="form-group" id="overrideDurationGroup" style="display: none;">
                    <label>Override Duration</label>
                    <input type="text" id="settingsOverrideDuration" placeholder="00:01:00:00" value="00:01:00:00">
                    <span class="form-hint">Format: DD:HH:MM:SS (e.g., 00:01:00:00 = 1 hour)</span>
                </div>
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
export function createGraphHTML(graph, graphIndex, scheduler) {
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
                <div class="graph-settings-wrapper collapsed">
                    <div class="graph-settings-header" data-action="toggleGraphSettings">
                        <ha-icon class="collapse-indicator" icon="mdi:chevron-down"></ha-icon>
                        <span>Graph Settings</span>
                    </div>
                    <div class="graph-settings-body">
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
                                <label>Step to min</label>
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
                                    <option value="0.1" ${graph.xSnap === 0.1 ? 'selected' : ''}>0.1</option>
                                    <option value="0.5" ${graph.xSnap === 0.5 ? 'selected' : ''}>0.5</option>
                                    <option value="1" ${graph.xSnap === 1 ? 'selected' : ''}>1</option>
                                    <option value="5" ${graph.xSnap === 5 ? 'selected' : ''}>5</option>
                                    <option value="10" ${graph.xSnap === 10 ? 'selected' : ''}>10</option>
                                    <option value="15" ${graph.xSnap === 15 ? 'selected' : ''}>15</option>
                                    <option value="30" ${graph.xSnap === 30 ? 'selected' : ''}>30</option>
                                    <option value="60" ${graph.xSnap === 60 ? 'selected' : ''}>60</option>
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

                        <div class="graph-settings x-axis-settings">
                            <div class="input-group">
                                <label>X-Axis</label>
                                <select data-graph-setting="xAxisType">
                                    <option value="time" ${(graph.xAxisType || 'time') === 'time' ? 'selected' : ''}>Time (24h)</option>
                                    <option value="entity" ${graph.xAxisType === 'entity' ? 'selected' : ''}>Entity Value</option>
                                </select>
                            </div>
                            <div class="input-group x-axis-entity-group" style="display: ${graph.xAxisType === 'entity' ? 'flex' : 'none'};">
                                <label>X Entity</label>
                                <div class="x-entity-autocomplete-wrapper">
                                    <input type="text" data-graph-setting="xAxisEntity" value="${graph.xAxisEntity || ''}" placeholder="sensor.lux" autocomplete="off">
                                    <div class="x-entity-autocomplete-list"></div>
                                </div>
                            </div>
                            <div class="input-group x-axis-min-group" style="display: ${graph.xAxisType === 'entity' ? 'flex' : 'none'};">
                                <label>X-Min</label>
                                <input type="number" data-graph-setting="xAxisMin" value="${graph.xAxisMin ?? 0}" style="width: 70px;">
                            </div>
                            <div class="input-group x-axis-max-group" style="display: ${graph.xAxisType === 'entity' ? 'flex' : 'none'};">
                                <label>X-Max</label>
                                <input type="number" data-graph-setting="xAxisMax" value="${graph.xAxisMax ?? 100}" style="width: 70px;">
                            </div>
                            <div class="input-group x-axis-unit-group" style="display: ${graph.xAxisType === 'entity' ? 'flex' : 'none'};">
                                <label>X Unit</label>
                                <input type="text" data-graph-setting="xAxisUnit" value="${graph.xAxisUnit || ''}" placeholder="lx" style="width: 50px;">
                            </div>
                        </div>
                    </div>
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
                            <input type="text" data-new-point-time placeholder="Time (HH:MM)" style="width: 80px; display: ${graph.xAxisType === 'entity' ? 'none' : 'inline-block'};">
                            <input type="number" data-new-point-x placeholder="X Value" style="width: 80px; display: ${graph.xAxisType === 'entity' ? 'inline-block' : 'none'};">
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
export function createSchedulerCardHTML(scheduler, domainIcon) {
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
