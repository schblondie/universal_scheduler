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
export const ATTRIBUTE_CONFIG = {
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
export function getAttributeConfig(attributeName) {
    return ATTRIBUTE_CONFIG[attributeName] || null;
}

/**
 * Get unit for an attribute
 *
 * @param {string} attributeName - The attribute name
 * @param {string} defaultUnit - Default unit if attribute is not configured
 * @returns {string} The unit string
 */
export function getAttributeUnit(attributeName, defaultUnit = '') {
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
export function getAttributeRange(attributeName, entityAttrs = {}, defaultRange = { minY: 0, maxY: 100 }) {
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
export function isKnownAttribute(attributeName) {
    return attributeName in ATTRIBUTE_CONFIG;
}
