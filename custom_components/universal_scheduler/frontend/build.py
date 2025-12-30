#!/usr/bin/env python3
"""
Universal Scheduler - Build/Bundle Script (Python version)

This script concatenates all module files into a single panel.js
Run with: python build.py
"""

import re
import os

frontend_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(frontend_dir, 'panel.js')

def read_file(filename):
    with open(os.path.join(frontend_dir, filename), 'r') as f:
        return f.read()

def strip_module_syntax(content, name):
    """Strip ES module syntax from content."""
    alias_declarations = []

    # Match imports like: import { foo as bar } from './module.js'
    import_regex = r'^import\s*\{([^}]+)\}\s*from\s*[\'"][^\'"]+[\'"]\s*;?\s*$'
    for match in re.finditer(import_regex, content, re.MULTILINE):
        imports = match.group(1)
        for part in imports.split(','):
            trimmed = part.strip()
            as_match = re.match(r'^(\w+)\s+as\s+(\w+)$', trimmed)
            if as_match:
                original_name = as_match.group(1)
                alias_name = as_match.group(2)
                alias_declarations.append(f'const {alias_name} = {original_name};')

    # Remove export statements
    content = re.sub(r'^export\s+(const|let|var|function|class)\s+', r'\1 ', content, flags=re.MULTILINE)
    content = re.sub(r'^export\s+\{[^}]*\}\s*;?\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^export\s+default\s+', '', content, flags=re.MULTILINE)

    # Remove import statements
    content = re.sub(r'^import\s+.*?from\s+[\'"][^\'"]+[\'"]\s*;?\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^import\s+[\'"][^\'"]+[\'"]\s*;?\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^import\s*\{[^}]*\}\s*from\s*[\'"][^\'"]+[\'"]\s*;?\s*$', '', content, flags=re.MULTILINE)

    alias_code = ''
    if alias_declarations:
        alias_code = '// Import aliases\n' + '\n'.join(alias_declarations) + '\n\n'

    return f'// === {name} ===\n{alias_code}{content}\n'

# Read all module files
style_content = read_file('styles.js')
template_content = read_file('templates.js')
utils_content = read_file('utils.js')
attribute_config_content = read_file('attribute-config.js')
graph_content = read_file('graph.js')
services_content = read_file('services.js')
panel_content = read_file('panel-modular.js')

# Build the bundled file
bundled = f'''/**
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

(function() {{
'use strict';

{strip_module_syntax(style_content, 'STYLES')}

{strip_module_syntax(template_content, 'TEMPLATES')}

{strip_module_syntax(utils_content, 'UTILITIES')}

{strip_module_syntax(attribute_config_content, 'ATTRIBUTE CONFIG')}

{strip_module_syntax(graph_content, 'GRAPH HANDLER')}

{strip_module_syntax(services_content, 'SERVICES')}

{strip_module_syntax(panel_content, 'MAIN PANEL')}

}})();
'''

with open(output_file, 'w') as f:
    f.write(bundled)

size_kb = os.path.getsize(output_file) / 1024
print(f'Bundled panel.js created ({size_kb:.1f} KB)')
