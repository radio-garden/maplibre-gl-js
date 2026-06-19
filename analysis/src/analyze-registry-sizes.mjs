#!/usr/bin/env node
/**
 * Multi-stage analysis of registry item sizes
 *
 * Stage 1: Parse src/index.ts to extract registry items
 * Stage 2: Analyze dependency graph for each item (excluding type imports)
 * Stage 3: Calculate size of each imported function/class in the dependency graph
 * Stage 4: Combine data to produce final size analysis
 */

import fs from 'fs';
import path from 'path';
import {exec} from 'child_process';
import {promisify} from 'util';
import {fileURLToPath} from 'url';

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');
const OUT_DIR = path.join(__dirname, '../out');
const DEPENDENCY_GRAPH_FILE = path.join(OUT_DIR, 'registry-dependency-graphs.json');
const EXPORT_SIZES_FILE = path.join(OUT_DIR, 'registry-export-sizes.json');
const FINAL_ANALYSIS_FILE = path.join(OUT_DIR, 'registry-size-analysis.json');
const MARKDOWN_REPORT_FILE = path.join(OUT_DIR, 'registry-size-analysis.md');

// ===== STAGE 1: Parse src/index.ts to extract registry items =====

function parseRegistryItems() {
    console.log('Stage 1: Parsing src/index.ts to extract registry items...\n');

    const indexPath = path.join(PROJECT_ROOT, 'src/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');

    // Build import map: { SymbolName: 'file/path.ts' }
    const importMap = {};
    const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const [, namedImports, defaultImport, importPath] = match;
        const normalizedPath = importPath.replace(/^\.\//, 'src/').replace(/\.ts$/, '') + '.ts';

        if (namedImports) {
            const names = namedImports.split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim());
            names.forEach(name => {
                importMap[name] = normalizedPath;
            });
        }

        if (defaultImport) {
            importMap[defaultImport] = normalizedPath;
        }
    }

    const registryItems = {};

    // Extract registry.source
    const sourceMatch = content.match(/registry\.source\s*=\s*{([^}]+)}/s);
    if (sourceMatch) {
        const entries = sourceMatch[1].matchAll(/'([^']+)':\s*(\w+)/g);
        for (const [, key, className] of entries) {
            if (importMap[className]) {
                registryItems[`sources:${key}`] = {
                    file: importMap[className],
                    export: className
                };
            }
        }
    }

    // Extract registry.layer
    const layerMatch = content.match(/registry\.layer\s*=\s*{([^}]+)}/s);
    if (layerMatch) {
        const entries = layerMatch[1].matchAll(/'([^']+)':\s*(\w+)/g);
        for (const [, key, className] of entries) {
            if (importMap[className]) {
                registryItems[`layers:${key}`] = {
                    file: importMap[className],
                    export: className
                };
            }
        }
    }

    // Extract registry.symbol
    const symbolMatch = content.match(/registry\.symbol\s*=\s*{([^}]+)}/s);
    if (symbolMatch) {
        const entries = symbolMatch[1].matchAll(/(\w+)[,\s]/g);
        for (const [, name] of entries) {
            if (importMap[name]) {
                registryItems[`symbol:${name}`] = {
                    file: importMap[name],
                    export: name
                };
            }
        }
    }

    // Extract registry.handler - handlers are complex, map to their main files
    const handlerFiles = {
        'mousePan': 'src/ui/handler/mouse.ts',
        'mousePitch': 'src/ui/handler/mouse.ts',
        'mouseRoll': 'src/ui/handler/mouse.ts',
        'mouseRotate': 'src/ui/handler/mouse.ts',
        'touchPan': 'src/ui/handler/touch_pan.ts',
        'touchRotate': 'src/ui/handler/two_fingers_touch.ts',
        'touchZoom': 'src/ui/handler/two_fingers_touch.ts',
        'clickZoom': 'src/ui/handler/click_zoom.ts',
        'tapZoom': 'src/ui/handler/tap_zoom.ts',
        'tapDragZoom': 'src/ui/handler/tap_drag_zoom.ts',
        'boxZoom': 'src/ui/handler/box_zoom.ts',
        'cooperativeGestures': 'src/ui/handler/cooperative_gestures.ts',
        'doubleClickZoom': 'src/ui/handler/shim/dblclick_zoom.ts',
        'dragPan': 'src/ui/handler/shim/drag_pan.ts',
        'dragRotate': 'src/ui/handler/shim/drag_rotate.ts',
        'touchZoomRotate': 'src/ui/handler/shim/two_fingers_touch.ts',
        'touchPitch': 'src/ui/handler/two_fingers_touch.ts',
        'scrollZoom': 'src/ui/handler/scroll_zoom.ts',
        'keyboard': 'src/ui/handler/keyboard.ts',
    };

    for (const [key, file] of Object.entries(handlerFiles)) {
        registryItems[`handlers:${key}`] = {
            file,
            export: key
        };
    }

    // Extract registry.draw
    const drawMatch = content.match(/registry\.draw\s*=\s*{([\s\S]+?)^}/m);
    if (drawMatch) {
        const drawBlock = drawMatch[1];
        const entries = drawBlock.matchAll(/'([^']+)':\s*(\w+)/g);
        for (const [, key, funcName] of entries) {
            if (importMap[funcName]) {
                registryItems[`draw:${key}`] = {
                    file: importMap[funcName],
                    export: funcName
                };
            }
        }
    }

    console.log(`Found ${Object.keys(registryItems).length} registry items\n`);
    return registryItems;
}

// ===== STAGE 2: Analyze dependency graphs using dpdm =====

async function analyzeSingleDependency(key, item) {
    try {
        const tempOutput = path.join(OUT_DIR, `tmp-dpdm-${Date.now()}-${Math.random().toString(36).substring(7)}.json`);

        await execAsync(
            `npx dpdm "${item.file}" -T --exit-code=circular:0 --tree=false --circular=false --warning=false -o "${tempOutput}"`,
            {
                cwd: PROJECT_ROOT,
                encoding: 'utf8',
                maxBuffer: 50 * 1024 * 1024
            }
        );

        const data = JSON.parse(fs.readFileSync(tempOutput, 'utf8'));
        fs.unlinkSync(tempOutput);

        const dependencies = new Set();

        if (data.tree) {
            for (const [file, deps] of Object.entries(data.tree)) {
                dependencies.add(file);
                if (deps && Array.isArray(deps)) {
                    deps.forEach(dep => {
                        if (dep.id) {
                            dependencies.add(dep.id);
                        }
                    });
                }
            }
        }

        console.log(`  ✓ ${key}: ${dependencies.size} dependencies`);

        return {
            key,
            result: {
                entryFile: item.file,
                entryExport: item.export,
                dependencies: Array.from(dependencies).sort()
            }
        };

    } catch (error) {
        console.log(`  ✗ ${key}: ${error.message}`);
        return {
            key,
            result: {
                entryFile: item.file,
                entryExport: item.export,
                error: error.message
            }
        };
    }
}

async function analyzeDependencyGraphs(registryItems) {
    console.log('Stage 2: Analyzing dependency graphs (excluding type imports)...\n');

    const graphs = {};
    const entries = Object.entries(registryItems);
    const BATCH_SIZE = 10; // Process 10 items in parallel

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(entries.length / BATCH_SIZE);

        console.log(`\nBatch ${batchNum}/${totalBatches}:`);

        const results = await Promise.all(
            batch.map(([key, item]) => analyzeSingleDependency(key, item))
        );

        results.forEach(({key, result}) => {
            graphs[key] = result;
        });
    }

    fs.writeFileSync(DEPENDENCY_GRAPH_FILE, JSON.stringify(graphs, null, 2), 'utf8');
    console.log(`\n✓ Dependency graphs saved to ${DEPENDENCY_GRAPH_FILE}\n`);

    return graphs;
}

// ===== STAGE 3: Calculate size of each export in dependency files =====

function analyzeExportSizes(graphs) {
    console.log('Stage 3: Analyzing export sizes for each dependency...\n');

    const exportSizes = {};
    const allFiles = new Set();

    // Collect all unique files across all dependency graphs
    for (const graph of Object.values(graphs)) {
        if (graph.dependencies) {
            graph.dependencies.forEach(file => allFiles.add(file));
        }
    }

    console.log(`Analyzing ${allFiles.size} unique files...\n`);

    let processed = 0;
    for (const file of allFiles) {
        processed++;
        if (processed % 50 === 0) {
            console.log(`Processed ${processed}/${allFiles.size} files...`);
        }

        const fullPath = path.resolve(PROJECT_ROOT, file);

        if (!fs.existsSync(fullPath)) {
            exportSizes[file] = { error: 'File not found' };
            continue;
        }

        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            // Find all exports in the file
            const exports = {};

            // Match: export class/function/const/interface/type Foo
            const exportRegex = /^export\s+(?:(?:async\s+)?(?:function|class|const|let|var|interface|type|enum))\s+(\w+)/gm;
            let match;

            while ((match = exportRegex.exec(content)) !== null) {
                const exportName = match[1];
                const startLine = content.substring(0, match.index).split('\n').length;

                // Estimate export size by finding its scope
                const exportSize = estimateExportSize(content, match.index, match[0]);

                exports[exportName] = {
                    startLine,
                    estimatedLines: exportSize
                };
            }

            exportSizes[file] = {
                totalLines: lines.length,
                exports,
                exportsCount: Object.keys(exports).length
            };

        } catch (error) {
            exportSizes[file] = { error: error.message };
        }
    }

    fs.writeFileSync(EXPORT_SIZES_FILE, JSON.stringify(exportSizes, null, 2), 'utf8');
    console.log(`\n✓ Export sizes saved to ${EXPORT_SIZES_FILE}\n`);

    return exportSizes;
}

function estimateExportSize(content, startIndex, exportDeclaration) {
    // Simple heuristic: count lines until we find the closing brace or semicolon
    const afterExport = content.substring(startIndex);

    // For simple exports (const x = ...), find the semicolon
    if (exportDeclaration.includes('const') || exportDeclaration.includes('let') || exportDeclaration.includes('var')) {
        const match = afterExport.match(/^[^;]+;/s);
        if (match) {
            return match[0].split('\n').length;
        }
    }

    // For classes/functions, count braces
    let braceCount = 0;
    let inString = false;
    let stringChar = null;
    let chars = 0;
    let lines = 1;

    for (let i = 0; i < afterExport.length; i++) {
        const char = afterExport[i];
        chars++;

        if (char === '\n') lines++;

        // Track strings to avoid counting braces in strings
        if ((char === '"' || char === "'" || char === '`') && afterExport[i - 1] !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
                stringChar = null;
            }
        }

        if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') {
                braceCount--;
                if (braceCount === 0 && chars > exportDeclaration.length) {
                    return lines;
                }
            }
        }

        // Safety limit
        if (lines > 1000) return lines;
    }

    return lines;
}

// ===== STAGE 4: Combine data to create final analysis =====

function createFinalAnalysis(graphs, exportSizes) {
    console.log('Stage 4: Creating final size analysis...\n');

    const analysis = {};

    for (const [key, graph] of Object.entries(graphs)) {
        if (graph.error) {
            analysis[key] = { error: graph.error };
            continue;
        }

        let totalLines = 0;
        let totalExports = 0;
        const dependencyDetails = [];

        for (const dep of graph.dependencies) {
            const sizeInfo = exportSizes[dep];

            if (!sizeInfo || sizeInfo.error) {
                dependencyDetails.push({
                    file: dep,
                    error: sizeInfo?.error || 'No size data'
                });
                continue;
            }

            totalLines += sizeInfo.totalLines || 0;
            totalExports += sizeInfo.exportsCount || 0;

            dependencyDetails.push({
                file: dep,
                lines: sizeInfo.totalLines,
                exportsCount: sizeInfo.exportsCount,
                exports: Object.keys(sizeInfo.exports || {})
            });
        }

        analysis[key] = {
            entryFile: graph.entryFile,
            entryExport: graph.entryExport,
            totalDependencies: graph.dependencies.length,
            totalLines,
            totalExports,
            dependencyDetails: dependencyDetails.sort((a, b) => (b.lines || 0) - (a.lines || 0))
        };
    }

    fs.writeFileSync(FINAL_ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf8');
    console.log(`✓ Final analysis saved to ${FINAL_ANALYSIS_FILE}\n`);

    return analysis;
}

// ===== STAGE 5: Generate markdown report =====

function calculateSharedDependencies(graphs) {
    // Build dependency sets for each item
    const depSets = {};
    for (const [key, graph] of Object.entries(graphs)) {
        if (graph.dependencies && !graph.error) {
            depSets[key] = new Set(graph.dependencies);
        }
    }

    // Calculate overlap percentages
    const overlaps = [];
    const keys = Object.keys(depSets);

    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            const key1 = keys[i];
            const key2 = keys[j];
            const deps1 = depSets[key1];
            const deps2 = depSets[key2];

            // Calculate intersection
            const intersection = new Set([...deps1].filter(x => deps2.has(x)));
            const union = new Set([...deps1, ...deps2]);

            // Calculate percentages
            const sharedCount = intersection.size;
            const percentOfFirst = deps1.size > 0 ? (sharedCount / deps1.size * 100) : 0;
            const percentOfSecond = deps2.size > 0 ? (sharedCount / deps2.size * 100) : 0;
            const percentOfUnion = union.size > 0 ? (sharedCount / union.size * 100) : 0;

            if (sharedCount > 0) {
                overlaps.push({
                    item1: key1,
                    item2: key2,
                    sharedCount,
                    total1: deps1.size,
                    total2: deps2.size,
                    percentOfFirst,
                    percentOfSecond,
                    percentOfUnion
                });
            }
        }
    }

    // Sort by shared count descending
    return overlaps.sort((a, b) => b.sharedCount - a.sharedCount);
}

function generateMarkdownReport(analysis, graphs) {
    console.log('Stage 5: Generating markdown report...\n');

    const items = Object.entries(analysis)
        .filter(([_, item]) => !item.error)
        .map(([key, item]) => ({
            key,
            lines: item.totalLines,
            deps: item.totalDependencies,
            exports: item.totalExports,
            entryFile: item.entryFile,
            entryExport: item.entryExport,
            dependencyDetails: item.dependencyDetails
        }))
        .sort((a, b) => b.lines - a.lines);

    // Group by category
    const categories = {};
    for (const item of items) {
        const category = item.key.split(':')[0];
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(item);
    }

    let markdown = `# MapLibre Registry Size Analysis

**Generated:** ${new Date().toISOString()}
**Total Items Analyzed:** ${items.length}
**Analysis Method:** Runtime dependencies only (type imports excluded via dpdm -T)

## Overview

This report analyzes the bundle size impact of each registry item in MapLibre GL JS. Each item's size includes all transitive runtime dependencies.

`;

    // All items sorted by size
    markdown += `## All Registry Items (Sorted by Size)

| Rank | Item | Lines | Dependencies | Exports |\n`;
    markdown += `|------|------|-------|--------------|----------|\n`;

    items.forEach((item, i) => {
        markdown += `| ${i + 1} | ${item.key} | ${item.lines.toLocaleString()} | ${item.deps} | ${item.exports} |\n`;
    });

    markdown += `\n`;

    // Category breakdown
    markdown += `## Breakdown by Category\n\n`;

    const sortedCategories = Object.entries(categories).sort((a, b) => {
        const aTotal = a[1].reduce((sum, item) => sum + item.lines, 0);
        const bTotal = b[1].reduce((sum, item) => sum + item.lines, 0);
        return bTotal - aTotal;
    });

    for (const [category, categoryItems] of sortedCategories) {
        const totalLines = categoryItems.reduce((sum, item) => sum + item.lines, 0);
        const avgLines = Math.round(totalLines / categoryItems.length);
        const totalDeps = categoryItems.reduce((sum, item) => sum + item.deps, 0);
        const avgDeps = Math.round(totalDeps / categoryItems.length);

        markdown += `### ${category.toUpperCase()}\n\n`;
        markdown += `- **Items:** ${categoryItems.length}\n`;
        markdown += `- **Total Size:** ${totalLines.toLocaleString()} lines\n`;
        markdown += `- **Average Size:** ${avgLines.toLocaleString()} lines per item\n`;
        markdown += `- **Average Dependencies:** ${avgDeps} per item\n\n`;

        markdown += `| Item | Lines | Deps | Exports |\n`;
        markdown += `|------|-------|------|----------|\n`;

        categoryItems.forEach(item => {
            const name = item.key.split(':')[1];
            markdown += `| ${name} | ${item.lines.toLocaleString()} | ${item.deps} | ${item.exports} |\n`;
        });

        markdown += `\n`;
    }

    // Shared Dependencies Matrix
    markdown += `## Shared Dependencies Matrix\n\n`;
    markdown += `This matrix shows both the percentage and absolute size (KB) of dependencies shared between each pair of registry items. Each cell (Row, Column) shows: percentage of Row's dependencies (shared KB).\n\n`;
    markdown += `**How to read:** If cell (lay:fill, lay:line) = "88% (19KB)", it means layers:fill shares 19KB of code with layers:line, which represents 88% of layers:fill's total dependencies.\n\n`;

    // Build dependency sets for matrix
    const depSets = {};
    const allKeys = [];

    for (const [key, graph] of Object.entries(graphs)) {
        if (graph.dependencies && !graph.error) {
            depSets[key] = new Set(graph.dependencies);
            allKeys.push(key);
        }
    }

    // Sort keys by category and then by name for better readability
    allKeys.sort((a, b) => {
        const catA = a.split(':')[0];
        const catB = b.split(':')[0];
        if (catA !== catB) return catA.localeCompare(catB);
        return a.localeCompare(b);
    });

    // Generate matrix header
    markdown += `| Item |`;
    for (const colKey of allKeys) {
        markdown += ` ${colKey} |`;
    }
    markdown += `\n`;

    // Generate header separator
    markdown += `|------|`;
    for (let i = 0; i < allKeys.length; i++) {
        markdown += `---:|`;
    }
    markdown += `\n`;

    // Calculate total lines for each item and each file for size calculations
    const itemLines = {};
    const fileLines = {};

    for (const [key, item] of Object.entries(analysis)) {
        if (!item.error) {
            itemLines[key] = item.totalLines;

            // Store file sizes from dependency details
            if (item.dependencyDetails) {
                for (const dep of item.dependencyDetails) {
                    if (dep.file && dep.lines && !fileLines[dep.file]) {
                        fileLines[dep.file] = dep.lines;
                    }
                }
            }
        }
    }

    // Generate matrix rows
    for (const rowKey of allKeys) {
        const rowDeps = depSets[rowKey];
        const rowTotalLines = itemLines[rowKey] || 0;

        markdown += `| ${rowKey} |`;

        for (const colKey of allKeys) {
            if (rowKey === colKey) {
                markdown += `  |`;
            } else {
                const colDeps = depSets[colKey];
                const intersection = new Set([...rowDeps].filter(x => colDeps.has(x)));

                // Calculate actual shared size by summing the lines of shared files
                let sharedLines = 0;
                for (const file of intersection) {
                    sharedLines += fileLines[file] || 0;
                }

                const kb = Math.round(sharedLines / 1000);
                const percentage = rowDeps.size > 0 ? Math.round((intersection.size / rowDeps.size) * 100) : 0;

                if (percentage === 0) {
                    markdown += ` - |`;
                } else {
                    markdown += ` ${percentage}% (${kb}KB) |`;
                }
            }
        }
        markdown += `\n`;
    }

    markdown += `\n`;

    // Add category grouping legend
    markdown += `### Category Legend\n\n`;
    const categoryGroups = new Map();
    for (const key of allKeys) {
        const category = key.split(':')[0];
        if (!categoryGroups.has(category)) {
            categoryGroups.set(category, []);
        }
        categoryGroups.get(category).push(key.split(':')[1] || key);
    }

    for (const [category, items] of Array.from(categoryGroups.entries()).sort()) {
        markdown += `- **${category}**: ${items.join(', ')}\n`;
    }

    markdown += `\n`;

    // Detailed breakdown
    markdown += `## Detailed Item Analysis\n\n`;

    for (const item of items.slice(0, 30)) {
        markdown += `### ${item.key}\n\n`;
        markdown += `- **Entry File:** \`${item.entryFile}\`\n`;
        markdown += `- **Entry Export:** \`${item.entryExport}\`\n`;
        markdown += `- **Total Lines:** ${item.lines.toLocaleString()}\n`;
        markdown += `- **Total Dependencies:** ${item.deps}\n`;
        markdown += `- **Total Exports:** ${item.exports}\n\n`;

        if (item.dependencyDetails && item.dependencyDetails.length > 0) {
            markdown += `**Top 10 Largest Dependencies:**\n\n`;
            markdown += `| File | Lines | Exports |\n`;
            markdown += `|------|-------|----------|\n`;

            item.dependencyDetails.slice(0, 10).forEach(dep => {
                if (dep.lines) {
                    const fileName = dep.file.replace(/^src\//, '');
                    markdown += `| \`${fileName}\` | ${dep.lines.toLocaleString()} | ${dep.exportsCount || 0} |\n`;
                }
            });

            markdown += `\n`;
        }
    }

    // Size distribution
    markdown += `## Size Distribution\n\n`;

    const buckets = {
        'Tiny (0-5K lines)': items.filter(i => i.lines <= 5000),
        'Small (5K-10K lines)': items.filter(i => i.lines > 5000 && i.lines <= 10000),
        'Medium (10K-15K lines)': items.filter(i => i.lines > 10000 && i.lines <= 15000),
        'Large (15K-20K lines)': items.filter(i => i.lines > 15000 && i.lines <= 20000),
        'Very Large (20K-25K lines)': items.filter(i => i.lines > 20000 && i.lines <= 25000),
        'Huge (25K+ lines)': items.filter(i => i.lines > 25000)
    };

    markdown += `| Size Range | Count | Items |\n`;
    markdown += `|------------|-------|-------|\n`;

    for (const [label, bucketItems] of Object.entries(buckets)) {
        const itemsList = bucketItems.length <= 5
            ? bucketItems.map(i => i.key).join(', ')
            : `${bucketItems.slice(0, 3).map(i => i.key).join(', ')}, ...`;

        markdown += `| ${label} | ${bucketItems.length} | ${itemsList || 'None'} |\n`;
    }

    markdown += `\n---\n\n`;
    markdown += `*Generated by \`pnpm run analyze-registry\`*\n`;

    fs.writeFileSync(MARKDOWN_REPORT_FILE, markdown, 'utf8');
    console.log(`✓ Markdown report saved to ${MARKDOWN_REPORT_FILE}\n`);
}

// ===== Main execution =====

async function main() {
    console.log('MapLibre Registry Size Analysis\n');
    console.log('═'.repeat(80));
    console.log('\n');

    // Ensure output directory exists
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    const registryItems = parseRegistryItems();
    const graphs = await analyzeDependencyGraphs(registryItems);
    const exportSizes = analyzeExportSizes(graphs);
    const analysis = createFinalAnalysis(graphs, exportSizes);
    generateMarkdownReport(analysis, graphs);

    // Print summary
    console.log('═'.repeat(80));
    console.log('SUMMARY');
    console.log('═'.repeat(80));
    console.log('');

    const items = Object.entries(analysis)
        .filter(([_, item]) => !item.error)
        .map(([key, item]) => ({
            key,
            lines: item.totalLines,
            deps: item.totalDependencies
        }))
        .sort((a, b) => b.lines - a.lines);

    console.log('Top 20 largest registry items:');
    console.log('');
    console.log('Rank | Item                                   | Lines    | Deps');
    console.log('-----|----------------------------------------|----------|------');

    items.slice(0, 20).forEach((item, i) => {
        const rank = (i + 1).toString().padStart(4);
        const name = item.key.padEnd(38);
        const lines = item.lines.toString().padStart(8);
        const deps = item.deps.toString().padStart(4);
        console.log(`${rank} | ${name} | ${lines} | ${deps}`);
    });

    console.log('');
    console.log('═'.repeat(80));
    console.log(`Analysis complete!`);
    console.log(`  - Markdown report: ${MARKDOWN_REPORT_FILE}`);
    console.log(`  - JSON data: ${FINAL_ANALYSIS_FILE}`);
    console.log('═'.repeat(80));
}

main().catch(console.error);
