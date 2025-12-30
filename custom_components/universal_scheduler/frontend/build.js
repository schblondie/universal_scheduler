/**
 * Universal Scheduler - Build/Bundle Script
 *
 * This script concatenates all module files into a single panel.js
 * Run with: node build.js
 *
 * Since Home Assistant panels don't support ES modules directly,
 * we bundle everything into a single IIFE (Immediately Invoked Function Expression)
 */

const fs = require('fs');
const path = require('path');

const frontendDir = __dirname;
const outputFile = path.join(frontendDir, 'panel.js');

// Read all the module files in order
const styleContent = fs.readFileSync(path.join(frontendDir, 'styles.js'), 'utf8');
const templateContent = fs.readFileSync(path.join(frontendDir, 'templates.js'), 'utf8');
const utilsContent = fs.readFileSync(path.join(frontendDir, 'utils.js'), 'utf8');
const graphContent = fs.readFileSync(path.join(frontendDir, 'graph.js'), 'utf8');
const servicesContent = fs.readFileSync(path.join(frontendDir, 'services.js'), 'utf8');
const panelContent = fs.readFileSync(path.join(frontendDir, 'panel-modular.js'), 'utf8');

// Helper to strip exports and imports, but create const aliases for 'as' imports
function stripModuleSyntax(content, name) {
    // First, capture aliased imports and create const declarations
    const aliasDeclarations = [];

    // Match imports like: import { foo as bar, baz as qux } from './module.js'
    const importRegex = /^import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"];?\s*$/gm;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const imports = match[1];
        // Parse each import, looking for "as" aliases
        const parts = imports.split(',');
        for (const part of parts) {
            const trimmed = part.trim();
            const asMatch = trimmed.match(/^(\w+)\s+as\s+(\w+)$/);
            if (asMatch) {
                const originalName = asMatch[1];
                const aliasName = asMatch[2];
                // Create a const declaration for the alias
                aliasDeclarations.push(`const ${aliasName} = ${originalName};`);
            }
        }
    }

    // Remove export statements
    content = content.replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ');
    content = content.replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
    content = content.replace(/^export\s+default\s+/gm, '');

    // Remove single-line import statements
    content = content.replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '');
    content = content.replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '');

    // Remove multi-line import statements (import { ... } from '...')
    content = content.replace(/^import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?\s*$/gm, '');
    // Handle imports spanning multiple lines
    content = content.replace(/^import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];?\s*$/gm, '');

    // Add alias declarations at the beginning if any exist
    const aliasCode = aliasDeclarations.length > 0
        ? `// Import aliases\n${aliasDeclarations.join('\n')}\n\n`
        : '';

    return `// === ${name} ===\n${aliasCode}${content}\n`;
}

// Build the bundled file
const bundled = `/**
 * Universal Scheduler Panel (Bundled)
 * Multi-entity scheduler with curve interpolation
 *
 * Auto-generated from modular source files
 * Do not edit directly - edit the source modules instead:
 * - styles.js
 * - templates.js
 * - utils.js
 * - graph.js
 * - services.js
 * - panel-modular.js
 *
 * Then run: node build.js
 */

(function() {
'use strict';

${stripModuleSyntax(styleContent, 'STYLES')}

${stripModuleSyntax(templateContent, 'TEMPLATES')}

${stripModuleSyntax(utilsContent, 'UTILITIES')}

${stripModuleSyntax(graphContent, 'GRAPH HANDLER')}

${stripModuleSyntax(servicesContent, 'SERVICES')}

${stripModuleSyntax(panelContent, 'MAIN PANEL')}

})();
`;

fs.writeFileSync(outputFile, bundled);
console.log(`Bundled panel.js created (${(bundled.length / 1024).toFixed(1)} KB)`);
