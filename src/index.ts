/**
 * Full MapLibre bundle with all default sources, layers, and shaders registered.
 * For tree-shaking, use 'maplibre-gl/core' and import only the features you need from './features'.
 *
 * @example
 * ```typescript
 * import { registry } from 'maplibre-gl/core';
 * import { registerCircle, registerLine, registerVectorSource } from 'maplibre-gl/features';
 *
 * registerVectorSource();
 * registerCircle();
 * registerLine();
 * ```
 */

import {
    // Sources
    registerCanvasSource,
    registerGeoJSONSource,
    registerImageSource,
    registerRasterDEMSource,
    registerRasterSource,
    registerVectorSource,
    registerVideoSource,
    // Tile decoders
    registerMLTDecoder,
    // Layers
    registerBackground,
    registerCircle,
    registerColorRelief,
    registerFill,
    registerFillExtrusion,
    registerHeatmap,
    registerHillshade,
    registerLine,
    registerRaster,
    registerSymbol,
    // Utilities
    registerUtilityShaders,
    registerGlobeProjection,
    registerTerrain
} from './core';

// ===== SOURCES =====
registerCanvasSource();
registerGeoJSONSource();
registerImageSource();
registerRasterDEMSource();
registerRasterSource();
registerVectorSource();
registerVideoSource();

// ===== TILE DECODERS =====
registerMLTDecoder();

// ===== LAYERS =====
registerBackground();
registerCircle();
registerColorRelief();
registerFill();
registerFillExtrusion();
registerHeatmap();
registerHillshade();
registerLine();
registerRaster();
registerSymbol();

registerTerrain();
registerGlobeProjection();

// ===== UTILITIES =====
registerUtilityShaders();

// Re-export everything from core
export * from './core';
