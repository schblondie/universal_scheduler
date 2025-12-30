/**
 * Universal Scheduler - Utilities Module
 * Helper functions for entity info, time formatting, icons, and interpolation
 */

// Controllable domains for scheduler
export const CONTROLLABLE_DOMAINS = [
    'light', 'climate', 'number', 'input_number',
    'fan', 'cover', 'humidifier', 'media_player'
];

/**
 * Get entity domain and auto-detect min/max values
 */
export function getEntityInfo(hass, entityId) {
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
export function getControllableEntities(hass) {
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
export function getNumericAttributes(hass, entityId) {
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
export function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Parse HH:MM time string to minutes
 * Returns null if invalid format
 */
export function timeToMinutes(timeStr) {
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
export function getDomainIcon(domain) {
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
export function generateInterpolatedPath(scheduler, startMinute, endMinute) {
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
            const y = interpolateValueWithStepToMin(x, points, mode, scheduler.minY, scheduler.maxY);
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
            ? interpolateValueWithStepToMin(endMinute, points, mode, scheduler.minY, scheduler.maxY)
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
export function interpolateValue(x, points, mode, minY, maxY) {
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
export function interpolateValueWithStepToMin(x, points, mode, minY, maxY) {
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

    // Step-to-min logic: if next point is at/below min, stay at min until the change point
    if (p2.y === minY) {
        return minY;
    }
    if (p1.y === minY) {
        // If coming from min, stay flat until we cross the point, then follow normal interpolation
        const t = (x - p1.x) / (p2.x - p1.x);
        if (t < 0.01) return minY;
        return interpolateValue(x, points, mode, minY, maxY);
    }

    // Otherwise, use normal interpolation
    return interpolateValue(x, points, mode, minY, maxY);
}

/**
 * Parse points data from various formats
 */
export function parsePoints(pointsData) {
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
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
