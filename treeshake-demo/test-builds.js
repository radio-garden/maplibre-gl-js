#!/usr/bin/env node
/**
 * Test script to verify builds and compare bundle sizes
 *
 * This script:
 * 1. Checks that both builds were created successfully
 * 2. Compares the JavaScript bundle sizes
 * 3. Reports the size difference (savings from tree-shaking)
 */

import {readdirSync, statSync, writeFileSync} from 'fs';
import {join} from 'path';
import {execSync} from 'child_process';

function getBundleSize(distDir, prefix) {
    const assetsDir = join(distDir, 'assets');
    try {
        const files = readdirSync(assetsDir);
        const jsFile = files.find(f => f.startsWith(prefix) && f.endsWith('.js') && !f.endsWith('.js.map'));
        if (!jsFile) {
            throw new Error(`No JS bundle starting with "${prefix}" found in ${assetsDir}`);
        }
        const filePath = join(assetsDir, jsFile);
        const stats = statSync(filePath);

        // Get gzipped size
        let gzipSize;
        try {
            const gzipOutput = execSync(`gzip -c "${filePath}" | wc -c`, {encoding: 'utf8'});
            gzipSize = parseInt(gzipOutput.trim(), 10);
        } catch {
            gzipSize = null;
        }

        return {
            file: jsFile,
            path: filePath,
            size: stats.size,
            gzipSize
        };
    } catch (err) {
        throw new Error(`Failed to read ${distDir}: ${err.message}`);
    }
}

function formatBytes(bytes) {
    if (bytes == null) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

const outputMarkdown = process.argv.includes('--markdown');

try {
    const fullBuild = getBundleSize('dist', 'full-');
    const coreBuild = getBundleSize('dist', 'core-');

    const savings = fullBuild.size - coreBuild.size;
    const savingsPercent = ((savings / fullBuild.size) * 100).toFixed(1);
    const gzipSavings = fullBuild.gzipSize && coreBuild.gzipSize
        ? fullBuild.gzipSize - coreBuild.gzipSize
        : null;
    const gzipSavingsPercent = gzipSavings && fullBuild.gzipSize
        ? ((gzipSavings / fullBuild.gzipSize) * 100).toFixed(1)
        : null;

    if (outputMarkdown) {
        // Output markdown table
        const markdown = `# MapLibre Tree-shaking Build Comparison

## Bundle Sizes

| Build | Raw Size | Gzipped |
|-------|----------|---------|
| Full | ${formatBytes(fullBuild.size)} | ${formatBytes(fullBuild.gzipSize)} |
| Core | ${formatBytes(coreBuild.size)} | ${formatBytes(coreBuild.gzipSize)} |
| **Savings** | **${formatBytes(savings)} (${savingsPercent}%)** | **${formatBytes(gzipSavings)} (${gzipSavingsPercent}%)** |

## Summary

- The core build is **${(fullBuild.size / coreBuild.size).toFixed(2)}x smaller** than the full build
- Tree-shaking saves **${formatBytes(savings)}** (${savingsPercent}%) raw, **${formatBytes(gzipSavings)}** (${gzipSavingsPercent}%) gzipped

## What's included in each build

### Full Build (full.html)
- All layer types (background, circle, fill, fill-extrusion, heatmap, hillshade, line, raster, symbol, color-relief)
- All source types (vector, raster, raster-dem, geojson, image, video, canvas)
- All projections (mercator, globe, vertical-perspective)
- All shaders
- Terrain support

### Core Build (core.html)
- Only registered features:
  - Image, Raster, Raster-DEM sources
  - Raster, Hillshade layers
  - Globe projection
  - Terrain
  - Utility shaders
`;
        writeFileSync('BUILD_COMPARISON.md', markdown);
        console.log('Wrote BUILD_COMPARISON.md');
    } else {
        // Console output
        console.log('Treeshake Demo - Build Test Results\n');
        console.log('='.repeat(50));

        console.log('\nFull Build:');
        console.log(`  File: ${fullBuild.file}`);
        console.log(`  Size: ${formatBytes(fullBuild.size)}`);
        console.log(`  Gzip: ${formatBytes(fullBuild.gzipSize)}`);

        console.log('\nCore Build:');
        console.log(`  File: ${coreBuild.file}`);
        console.log(`  Size: ${formatBytes(coreBuild.size)}`);
        console.log(`  Gzip: ${formatBytes(coreBuild.gzipSize)}`);

        console.log('\n' + '='.repeat(50));
        console.log('\nTree-shaking Results:');
        console.log(`  Raw savings:  ${formatBytes(savings)} (${savingsPercent}%)`);
        console.log(`  Gzip savings: ${formatBytes(gzipSavings)} (${gzipSavingsPercent}%)`);
        console.log(`  Core build is ${(fullBuild.size / coreBuild.size).toFixed(2)}x smaller`);
    }

    if (savings > 0) {
        if (!outputMarkdown) {
            console.log('\n✅ Tree-shaking is working! The core build is smaller.');
        }
        process.exit(0);
    } else {
        console.log('\n❌ Warning: Core build is not smaller than full build.');
        console.log('   Tree-shaking may not be working correctly.');
        process.exit(1);
    }
} catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('\nMake sure to run "pnpm run build" first.');
    process.exit(1);
}
