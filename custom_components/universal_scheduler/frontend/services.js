/**
 * Universal Scheduler - Services Module
 * Home Assistant service calls for applying values, saving, and deleting schedulers
 */

import { interpolateValue, interpolateValueWithStepToMin } from './utils.js';
import { getAttributeUnit } from './attribute-config.js';

/**
 * Apply scheduler value to entity
 */
const roundToStep = (value, step) => Math.round(value / step) * step;

async function callWithFallback(callFactory, values) {
    let lastError;
    for (const val of values) {
        try {
            await callFactory(val);
            return val;
        } catch (err) {
            lastError = err;
            console.warn('Apply fallback attempt failed for value', val, err);
        }
    }
    throw lastError ?? new Error('All apply attempts failed');
}

async function applySchedulerNow(hass, scheduler) {
    // Get current time in minutes
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Get interpolated value at current time
    const currentValue = (scheduler.stepToZero
        ? interpolateValueWithStepToMin
        : interpolateValue)(currentMinutes, scheduler.points, scheduler.mode, scheduler.minY, scheduler.maxY);

    // Call appropriate service based on domain
    const domain = scheduler.domain;
    const targetEntity = scheduler.entityId;

    switch (domain) {
        case 'light':
            const brightness = Math.round((currentValue / 100) * 255);
            if (brightness > 0) {
                await hass.callService('light', 'turn_on', {
                    entity_id: targetEntity,
                    brightness: brightness,
                    transition: 2
                });
            } else {
                await hass.callService('light', 'turn_off', {
                    entity_id: targetEntity,
                    transition: 2
                });
            }
            break;
        case 'climate':
            await callWithFallback(
                (val) => hass.callService('climate', 'set_temperature', {
                    entity_id: targetEntity,
                    temperature: val,
                }),
                [
                    Math.round(currentValue * 10) / 10,     // original 0.1 precision
                    roundToStep(currentValue, 0.5),          // fallback to 0.5 step
                    roundToStep(currentValue, 1),            // fallback to 1 step
                ],
            );
            break;
        case 'fan':
            if (currentValue > 0) {
                await hass.callService('fan', 'set_percentage', {
                    entity_id: targetEntity,
                    percentage: Math.round(currentValue)
                });
            } else {
                await hass.callService('fan', 'turn_off', {
                    entity_id: targetEntity
                });
            }
            break;
        case 'cover':
            await hass.callService('cover', 'set_cover_position', {
                entity_id: targetEntity,
                position: Math.round(currentValue)
            });
            break;
        case 'humidifier':
            await hass.callService('humidifier', 'set_humidity', {
                entity_id: targetEntity,
                humidity: Math.round(currentValue)
            });
            break;
        case 'input_number':
            await callWithFallback(
                (val) => hass.callService('input_number', 'set_value', {
                    entity_id: targetEntity,
                    value: val,
                }),
                [
                    Math.round(currentValue * 100) / 100,   // original 0.01 precision
                    roundToStep(currentValue, 0.5),          // fallback to 0.5 step
                    roundToStep(currentValue, 1),            // fallback to 1 step
                ],
            );
            break;
        case 'media_player':
            await hass.callService('media_player', 'volume_set', {
                entity_id: targetEntity,
                volume_level: currentValue / 100
            });
            break;
        default:
            console.warn('Unknown domain for apply:', domain);
            return Promise.reject(new Error(`Unknown domain: ${domain}`));
    }

    console.log(`Applied ${currentValue.toFixed(1)} to ${targetEntity}`);
}

/**
 * Save scheduler configuration to Home Assistant (multi-graph format)
 */
export function saveScheduler(hass, entityId, scheduler) {
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
        x_axis_min: graph.xAxisMin ?? null,
        x_axis_max: graph.xAxisMax ?? null,
        x_axis_unit: graph.xAxisUnit || null,
        points: graph.points || []
    }));

    return hass.callService('universal_scheduler', 'set_schedule_config', {
        entity_id: entityId,
        target_entity: scheduler.entityId,
        domain: scheduler.domain,
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
export function deleteScheduler(hass, entityId) {
    return hass.callService('universal_scheduler', 'delete_scheduler', {
        entity_id: entityId
    }).then(() => {
        console.log('Scheduler deleted:', entityId);
    });
}

/**
 * Load schedulers from Home Assistant via WebSocket (multi-graph format)
 */
export function loadSchedulersFromHA(hass, getEntityInfo) {
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
                xAxisMin: graph.x_axis_min ?? null,
                xAxisMax: graph.x_axis_max ?? null,
                xAxisUnit: graph.x_axis_unit || '',
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
export function loadSchedulersFromEntities(hass, getEntityInfo, parsePoints) {
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
