/**
 * Universal Scheduler - Graph Module
 * Graph rendering, mouse/touch interactions, and visual updates
 */

import { interpolateValue, interpolateValueWithStepToMin, generateInterpolatedPath, minutesToTime, clamp } from './utils.js';

/**
 * Graph rendering and interaction handler
 */
export class GraphHandler {
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
        const scheduledValue = (scheduler.stepToZero
            ? interpolateValueWithStepToMin(currentMinutes, scheduler.points, scheduler.mode, scheduler.minY, scheduler.maxY)
            : interpolateValue(currentMinutes, scheduler.points, scheduler.mode, scheduler.minY, scheduler.maxY));
        // Next update is driven by the configured interval (even if value remains the same)
        const updateIntervalSec = parseInt(scheduler.updateInterval) || 300;
        const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        // Next execution is the next multiple of the interval >= currentSeconds (inclusive)
        const nextUpdateSeconds = Math.ceil(currentSeconds / updateIntervalSec) * updateIntervalSec;
        const nextUpdateSecondsWrap = nextUpdateSeconds >= 86400 ? nextUpdateSeconds - 86400 : nextUpdateSeconds;
        const nextUpdateMinutes = nextUpdateSecondsWrap / 60;
        const nextValue = (scheduler.stepToZero
            ? interpolateValueWithStepToMin(nextUpdateMinutes, scheduler.points, scheduler.mode, scheduler.minY, scheduler.maxY)
            : interpolateValue(nextUpdateMinutes, scheduler.points, scheduler.mode, scheduler.minY, scheduler.maxY));

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
     * Supports both time-based and entity-based X-axis
     */
    renderXAxisMulti(section, graph) {
        const xAxis = section.querySelector('.graph-x-axis');
        if (!xAxis) return;

        const isEntityBased = graph.xAxisType === 'entity';

        if (isEntityBased) {
            // Entity-based X-axis
            const xMin = graph.xAxisMin ?? 0;
            const xMax = graph.xAxisMax ?? 100;
            const xUnit = graph.xAxisUnit || '';
            const xRange = xMax - xMin;

            const zoomLevel = graph.zoomLevel || 1;
            const zoomOffset = graph.zoomOffset || 0;
            const visibleRange = xRange / zoomLevel;
            const startValue = xMin + zoomOffset * xRange;
            const endValue = startValue + visibleRange;

            // Calculate appropriate interval for entity values
            let interval = this._calculateEntityAxisInterval(xRange, zoomLevel);

            let labels = [];
            for (let v = Math.ceil(startValue / interval) * interval; v <= endValue; v += interval) {
                const percent = ((v - startValue) / visibleRange) * 100;
                const displayValue = Number.isInteger(v) ? v : v.toFixed(1);
                labels.push(`<span style="position: absolute; left: ${percent}%; transform: translateX(-50%);">${displayValue}${xUnit}</span>`);
            }
            xAxis.innerHTML = labels.join('');
        } else {
            // Time-based X-axis (original logic)
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
    }

    /**
     * Calculate appropriate interval for entity-based X-axis labels
     */
    _calculateEntityAxisInterval(range, zoomLevel) {
        const visibleRange = range / zoomLevel;
        // Aim for roughly 6-8 labels on the axis
        const targetLabels = 7;
        const rawInterval = visibleRange / targetLabels;

        // Round to nice numbers
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
        const normalized = rawInterval / magnitude;

        let niceInterval;
        if (normalized <= 1.5) niceInterval = 1;
        else if (normalized <= 3) niceInterval = 2;
        else if (normalized <= 7) niceInterval = 5;
        else niceInterval = 10;

        return niceInterval * magnitude;
    }

    /**
     * Render grid for a graph section (multi-graph)
     * Supports both time-based and entity-based X-axis
     */
    renderGridMulti(section, graph) {
        const gridContainer = section.querySelector('.grid-lines');
        if (!gridContainer) return;

        const isEntityBased = graph.xAxisType === 'entity';

        // Horizontal grid lines (Y-axis) - same for both modes
        let html = '';
        const ySteps = 5;
        for (let i = 1; i < ySteps; i++) {
            const percent = (i / ySteps) * 100;
            html += `<div class="grid-line-h" style="top: ${percent}%;"></div>`;
        }

        if (isEntityBased) {
            // Entity-based X-axis grid
            const xMin = graph.xAxisMin ?? 0;
            const xMax = graph.xAxisMax ?? 100;
            const xRange = xMax - xMin;
            const zoomLevel = graph.zoomLevel || 1;
            const zoomOffset = graph.zoomOffset || 0;
            const visibleRange = xRange / zoomLevel;
            const startValue = xMin + zoomOffset * xRange;
            const endValue = startValue + visibleRange;

            const majorInterval = this._calculateEntityAxisInterval(xRange, zoomLevel);
            const minorInterval = majorInterval / 5;

            for (let v = Math.ceil(startValue / minorInterval) * minorInterval; v <= endValue; v += minorInterval) {
                const percent = ((v - startValue) / visibleRange) * 100;
                const isMajor = Math.abs(v % majorInterval) < minorInterval / 2;
                html += `<div class="grid-line-v ${isMajor ? 'major' : ''}" style="left: ${percent}%;"></div>`;
            }
        } else {
            // Time-based X-axis grid (original logic)
            const zoomLevel = graph.zoomLevel || 1;
            const zoomOffset = graph.zoomOffset || 0;
            const visibleMinutes = 1440 / zoomLevel;
            const startMinute = zoomOffset;
            const endMinute = startMinute + visibleMinutes;

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
        }

        gridContainer.innerHTML = html;
    }

    /**
     * Update current time/value marker for a graph section (multi-graph)
     * For time-based: shows current time
     * For entity-based: shows current entity value
     */
    updateCurrentTimeMarkerMulti(section, graph, hass) {
        const marker = section.querySelector('[data-time-marker]');
        if (!marker) return;

        const isEntityBased = graph.xAxisType === 'entity';

        if (isEntityBased && hass) {
            // Entity-based: show marker at current entity value
            const xAxisEntity = graph.xAxisEntity;
            const entityState = hass.states?.[xAxisEntity];

            if (!entityState) {
                marker.style.display = 'none';
                return;
            }

            const currentValue = parseFloat(entityState.state);
            if (isNaN(currentValue)) {
                marker.style.display = 'none';
                return;
            }

            const xMin = graph.xAxisMin ?? 0;
            const xMax = graph.xAxisMax ?? 100;
            const xRange = xMax - xMin;
            const zoomLevel = graph.zoomLevel || 1;
            const zoomOffset = graph.zoomOffset || 0;
            const visibleRange = xRange / zoomLevel;
            const startValue = xMin + zoomOffset * xRange;
            const endValue = startValue + visibleRange;

            // Clamp value to visible range for display
            if (currentValue >= startValue && currentValue <= endValue) {
                const xPercent = ((currentValue - startValue) / visibleRange) * 100;
                marker.style.left = `${xPercent}%`;
                marker.style.display = 'block';
            } else {
                marker.style.display = 'none';
            }
        } else {
            // Time-based: show current time marker
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
    }

    /**
     * Get the current X value for interpolation based on graph type
     * For time-based: returns current time in minutes
     * For entity-based: returns current entity state value
     */
    getCurrentXValue(graph, hass) {
        const isEntityBased = graph.xAxisType === 'entity';

        if (isEntityBased && hass) {
            const xAxisEntity = graph.xAxisEntity;
            const entityState = hass.states?.[xAxisEntity];

            if (!entityState) return null;

            const currentValue = parseFloat(entityState.state);
            if (isNaN(currentValue)) return null;

            // Clamp to min/max bounds
            const xMin = graph.xAxisMin ?? 0;
            const xMax = graph.xAxisMax ?? 100;
            return Math.max(xMin, Math.min(xMax, currentValue));
        } else {
            // Time-based
            const now = new Date();
            return now.getHours() * 60 + now.getMinutes();
        }
    }

    /**
     * Update current value display for a graph section (multi-graph)
     * Supports both time-based and entity-based X-axis
     */
    updateCurrentValueMulti(entityId, graphIndex, section) {
        const scheduler = this.schedulers[entityId];
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;
        const graph = scheduler.graphs[graphIndex];
        if (!graph) return;

        const actualValueDisplay = section.querySelector('[data-actual-value]');
        const scheduledValueDisplay = section.querySelector('[data-scheduled-value]');
        const nextValueDisplay = section.querySelector('[data-next-value]');

        const hass = this.panel._hass;
        const isEntityBased = graph.xAxisType === 'entity';
        const currentX = this.getCurrentXValue(graph, hass);
        const unit = graph.unit || '';

        // Get actual entity value from Home Assistant
        const entityState = hass?.states[scheduler.entityId];
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

        // Get interpolated scheduled value at current X position
        let scheduledValue = graph.minY;
        if (currentX !== null) {
            scheduledValue = (graph.stepToZero
                ? interpolateValueWithStepToMin(currentX, graph.points, graph.mode, graph.minY, graph.maxY)
                : interpolateValue(currentX, graph.points, graph.mode, graph.minY, graph.maxY));
        }

        // Handle entity-based graphs differently for "next" display
        if (isEntityBased) {
            // For entity-based, show current X value instead of "next time"
            const xUnit = graph.xAxisUnit || '';
            if (actualValueDisplay) actualValueDisplay.textContent = actualValue;
            if (scheduledValueDisplay) scheduledValueDisplay.textContent = `${scheduledValue.toFixed(1)}${unit}`;
            if (nextValueDisplay) {
                if (currentX !== null) {
                    nextValueDisplay.textContent = `X: ${currentX.toFixed(1)}${xUnit}`;
                } else {
                    nextValueDisplay.textContent = 'X: --';
                }
            }
            return;
        }

        // Time-based: original next change calculation
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
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

            const checkValue = (graph.stepToZero
                ? interpolateValueWithStepToMin(checkMinutes, graph.points, graph.mode, graph.minY, graph.maxY)
                : interpolateValue(checkMinutes, graph.points, graph.mode, graph.minY, graph.maxY));

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
     * Supports both time-based and entity-based X-axis
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

        // Format X value based on axis type
        const isEntityBased = graph.xAxisType === 'entity';
        const xDisplay = isEntityBased
            ? `${point.x.toFixed(1)}${graph.xAxisUnit || ''}`
            : minutesToTime(point.x);

        tooltip.innerHTML = `
            <span class="time">${xDisplay}</span>
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
     * Supports both time-based and entity-based X-axis
     */
    renderPointsListMulti(entityId, graphIndex, section) {
        const scheduler = this.schedulers[entityId];
        if (!scheduler || !Array.isArray(scheduler.graphs)) return;
        const graph = scheduler.graphs[graphIndex];
        if (!graph) return;

        const pointsList = section.querySelector('[data-points-list]');
        if (!pointsList) return;

        const isEntityBased = graph.xAxisType === 'entity';
        const xMin = isEntityBased ? (graph.xAxisMin ?? 0) : 0;
        const xMax = isEntityBased ? (graph.xAxisMax ?? 100) : 1440;
        const xUnit = isEntityBased ? (graph.xAxisUnit || '') : '';

        let html = '';
        graph.points.forEach((point, index) => {
            if (isEntityBased) {
                // For entity-based X-axis, use numeric input
                html += `
                    <div class="point-row" data-point-index="${index}">
                        <span class="point-index">#${index + 1}</span>
                        <input type="number" data-point-x value="${point.x.toFixed(2)}"
                               min="${xMin}" max="${xMax}"
                               step="${graph.xSnap || 0.1}" title="X Value${xUnit ? ' (' + xUnit + ')' : ''}" style="width: 80px;">
                        <input type="number" data-point-value value="${point.y.toFixed(2)}"
                               min="${graph.minY}" max="${graph.maxY}"
                               step="${graph.ySnap || 0.1}" title="Y Value" style="width: 80px;">
                        <button class="point-delete" data-action="deletePoint" ${graph.points.length <= 2 ? 'disabled' : ''}>
                            <ha-icon icon="mdi:delete"></ha-icon>
                        </button>
                    </div>
                `;
            } else {
                // For time-based X-axis, use time input
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
            }
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
     * Supports both time-based and entity-based X-axis
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

        const isEntityBased = graph.xAxisType === 'entity';
        const zoomLevel = graph.zoomLevel || 1;
        const zoomOffset = graph.zoomOffset || 0;

        // Calculate X-axis range based on type
        let xMin, xMax, visibleRange, startValue;
        if (isEntityBased) {
            xMin = graph.xAxisMin ?? 0;
            xMax = graph.xAxisMax ?? 100;
            const xRange = xMax - xMin;
            visibleRange = xRange / zoomLevel;
            startValue = xMin + zoomOffset * xRange;
        } else {
            xMin = 0;
            xMax = 1440;
            visibleRange = 1440 / zoomLevel;
            startValue = zoomOffset;
        }

        const yRange = graph.maxY - graph.minY;

        // Per-graph xSnap: use graph value if explicitly set (even if 0=off), otherwise fallback to global
        // For entity-based, calculate a reasonable default snap based on range
        let xSnap;
        if (graph.xSnap !== undefined) {
            xSnap = graph.xSnap;
        } else if (isEntityBased) {
            // For entity-based, default to no snap or auto-calculate
            xSnap = 0;
        } else {
            xSnap = this.globalSnapMinutes;
        }
        const ySnap = graph.ySnap || 0;

        const getCoords = (ev) => {
            let xRatio = (ev.clientX - rect.left) / rect.width;
            let yRatio = 1 - (ev.clientY - rect.top) / rect.height;

            let x = startValue + xRatio * visibleRange;
            let y = graph.minY + yRatio * yRange;

            if (xSnap > 0) x = Math.round(x / xSnap) * xSnap;
            if (ySnap > 0) y = Math.round(y / ySnap) * ySnap;

            x = Math.max(xMin, Math.min(xMax, x));
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
                    if (isEntityBased) {
                        const unitsPerPixel = visibleRange / rect.width;
                        const totalRange = xMax - xMin;
                        const newOffset = (graph.zoomOffset || 0) + (deltaX * unitsPerPixel) / totalRange;
                        graph.zoomOffset = Math.max(0, Math.min(1 - 1/zoomLevel, newOffset));
                    } else {
                        const minutesPerPixel = visibleRange / rect.width;
                        graph.zoomOffset = Math.max(0, Math.min(1440 - visibleRange, (graph.zoomOffset || 0) + deltaX * minutesPerPixel));
                    }
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
                const hasConflict = graph.points.some((p, i) => i !== index && Math.abs(p.x - coords.x) < (isEntityBased ? 0.01 : 1));
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
                        if (isEntityBased) {
                            const unitsPerPixel = visibleRange / rect.width;
                            const totalRange = xMax - xMin;
                            const newOffset = (graph.zoomOffset || 0) + (deltaX * unitsPerPixel) / totalRange;
                            graph.zoomOffset = Math.max(0, Math.min(1 - 1/zoomLevel, newOffset));
                        } else {
                            const minutesPerPixel = visibleRange / rect.width;
                            graph.zoomOffset = Math.max(0, Math.min(1440 - visibleRange, (graph.zoomOffset || 0) + deltaX * minutesPerPixel));
                        }
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
                    // Use appropriate tolerance for point conflict detection
                    const xTolerance = isEntityBased ? (xMax - xMin) * 0.005 : 1;
                    const existingIndex = graph.points.findIndex(p => Math.abs(p.x - coords.x) < xTolerance);

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
