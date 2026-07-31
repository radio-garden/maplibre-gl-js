import {prepare} from './shaders/shaders';
import atmosphereFrag from './shaders/glsl/atmosphere.fragment.glsl.g';
import atmosphereVert from './shaders/glsl/atmosphere.vertex.glsl.g';
import backgroundFrag from './shaders/glsl/background.fragment.glsl.g';
import backgroundVert from './shaders/glsl/background.vertex.glsl.g';
import backgroundPatternFrag from './shaders/glsl/background_pattern.fragment.glsl.g';
import backgroundPatternVert from './shaders/glsl/background_pattern.vertex.glsl.g';
import circleFrag from './shaders/glsl/circle.fragment.glsl.g';
import circleVert from './shaders/glsl/circle.vertex.glsl.g';
import clippingMaskFrag from './shaders/glsl/clipping_mask.fragment.glsl.g';
import clippingMaskVert from './shaders/glsl/clipping_mask.vertex.glsl.g';
import collisionBoxFrag from './shaders/glsl/collision_box.fragment.glsl.g';
import collisionBoxVert from './shaders/glsl/collision_box.vertex.glsl.g';
import collisionCircleFrag from './shaders/glsl/collision_circle.fragment.glsl.g';
import collisionCircleVert from './shaders/glsl/collision_circle.vertex.glsl.g';
import debugFrag from './shaders/glsl/debug.fragment.glsl.g';
import debugVert from './shaders/glsl/debug.vertex.glsl.g';
import depthVert from './shaders/glsl/depth.vertex.glsl.g';
import fillExtrusionFrag from './shaders/glsl/fill_extrusion.fragment.glsl.g';
import fillExtrusionVert from './shaders/glsl/fill_extrusion.vertex.glsl.g';
import fillExtrusionPatternFrag from './shaders/glsl/fill_extrusion_pattern.fragment.glsl.g';
import fillExtrusionPatternVert from './shaders/glsl/fill_extrusion_pattern.vertex.glsl.g';
import fillFrag from './shaders/glsl/fill.fragment.glsl.g';
import fillVert from './shaders/glsl/fill.vertex.glsl.g';
import fillOutlineFrag from './shaders/glsl/fill_outline.fragment.glsl.g';
import fillOutlineVert from './shaders/glsl/fill_outline.vertex.glsl.g';
import fillPatternFrag from './shaders/glsl/fill_pattern.fragment.glsl.g';
import fillPatternVert from './shaders/glsl/fill_pattern.vertex.glsl.g';
import fillOutlinePatternFrag from './shaders/glsl/fill_outline_pattern.fragment.glsl.g';
import fillOutlinePatternVert from './shaders/glsl/fill_outline_pattern.vertex.glsl.g';
import heatmapFrag from './shaders/glsl/heatmap.fragment.glsl.g';
import heatmapVert from './shaders/glsl/heatmap.vertex.glsl.g';
import heatmapTextureFrag from './shaders/glsl/heatmap_texture.fragment.glsl.g';
import heatmapTextureVert from './shaders/glsl/heatmap_texture.vertex.glsl.g';
import hillshadeFrag from './shaders/glsl/hillshade.fragment.glsl.g';
import hillshadeVert from './shaders/glsl/hillshade.vertex.glsl.g';
import hillshadePrepareFrag from './shaders/glsl/hillshade_prepare.fragment.glsl.g';
import hillshadePrepareVert from './shaders/glsl/hillshade_prepare.vertex.glsl.g';
import lineFrag from './shaders/glsl/line.fragment.glsl.g';
import lineVert from './shaders/glsl/line.vertex.glsl.g';
import lineGradientFrag from './shaders/glsl/line_gradient.fragment.glsl.g';
import lineGradientVert from './shaders/glsl/line_gradient.vertex.glsl.g';
import linePatternFrag from './shaders/glsl/line_pattern.fragment.glsl.g';
import linePatternVert from './shaders/glsl/line_pattern.vertex.glsl.g';
import lineSDFFrag from './shaders/glsl/line_sdf.fragment.glsl.g';
import lineSDFVert from './shaders/glsl/line_sdf.vertex.glsl.g';
import lineGradientSDFFrag from './shaders/glsl/line_gradient_sdf.fragment.glsl.g';
import lineGradientSDFVert from './shaders/glsl/line_gradient_sdf.vertex.glsl.g';
import preludeFrag from './shaders/glsl/_prelude.fragment.glsl.g';
import preludeVert from './shaders/glsl/_prelude.vertex.glsl.g';
import projectionErrorMeasurementFrag from './shaders/glsl/projection_error_measurement.fragment.glsl.g';
import projectionErrorMeasurementVert from './shaders/glsl/projection_error_measurement.vertex.glsl.g';
import projectionMercatorVert from './shaders/glsl/_projection_mercator.vertex.glsl.g';
import projectionGlobeVert from './shaders/glsl/_projection_globe.vertex.glsl.g';
import rasterFrag from './shaders/glsl/raster.fragment.glsl.g';
import rasterVert from './shaders/glsl/raster.vertex.glsl.g';
import colorReliefFrag from './shaders/glsl/color_relief.fragment.glsl.g';
import colorReliefVert from './shaders/glsl/color_relief.vertex.glsl.g';
import skyFrag from './shaders/glsl/sky.fragment.glsl.g';
import skyVert from './shaders/glsl/sky.vertex.glsl.g';
import symbolIconFrag from './shaders/glsl/symbol_icon.fragment.glsl.g';
import symbolIconVert from './shaders/glsl/symbol_icon.vertex.glsl.g';
import symbolSDFFrag from './shaders/glsl/symbol_sdf.fragment.glsl.g';
import symbolSDFVert from './shaders/glsl/symbol_sdf.vertex.glsl.g';
import symbolTextAndIconFrag from './shaders/glsl/symbol_text_and_icon.fragment.glsl.g';
import symbolTextAndIconVert from './shaders/glsl/symbol_text_and_icon.vertex.glsl.g';
import terrainFrag from './shaders/glsl/terrain.fragment.glsl.g';
import terrainVert from './shaders/glsl/terrain.vertex.glsl.g';
import terrainDepthFrag from './shaders/glsl/terrain_depth.fragment.glsl.g';
import terrainVertDepth from './shaders/glsl/terrain_depth.vertex.glsl.g';
import terrainCoordsFrag from './shaders/glsl/terrain_coords.fragment.glsl.g';
import terrainVertCoords from './shaders/glsl/terrain_coords.vertex.glsl.g';
import {registry} from './registry';
import {drawBackground} from './webgl/draw/draw_background';
import {drawCircles} from './webgl/draw/draw_circle';
import {drawFill} from './webgl/draw/draw_fill';
import {drawFillExtrusion} from './webgl/draw/draw_fill_extrusion';
import {drawHeatmap} from './webgl/draw/draw_heatmap';
import {drawHillshade} from './webgl/draw/draw_hillshade';
import {drawColorRelief} from './webgl/draw/draw_color_relief';
import {drawLine} from './webgl/draw/draw_line';
import {drawRaster} from './webgl/draw/draw_raster';
import {drawSymbols} from './webgl/draw/draw_symbol';
import {drawTerrain, drawDepth, drawCoords} from './webgl/draw/draw_terrain';
import {CanvasSource} from './source/canvas_source';
import {GeoJSONSource} from './source/geojson_source';
import {ImageSource} from './source/image_source';
import {RasterDEMTileSource} from './source/raster_dem_tile_source';
import {RasterTileSource} from './source/raster_tile_source';
import {VectorTileSource} from './source/vector_tile_source';
import {VideoSource} from './source/video_source';
import {MLTVectorTile} from './source/vector_tile_mlt';
import {PauseablePlacement} from './style/pauseable_placement';
import {CrossTileSymbolIndex} from './symbol/cross_tile_symbol_index';
import {performSymbolLayout} from './symbol/symbol_layout';
import {MercatorProjection} from './geo/projection/mercator_projection';
import {MercatorTransform} from './geo/projection/mercator_transform';
import {MercatorCameraHelper} from './geo/projection/mercator_camera_helper';
import {GlobeProjection} from './geo/projection/globe_projection';
import {GlobeTransform} from './geo/projection/globe_transform';
import {GlobeCameraHelper} from './geo/projection/globe_camera_helper';
import {VerticalPerspectiveProjection} from './geo/projection/vertical_perspective_projection';
import {VerticalPerspectiveTransform} from './geo/projection/vertical_perspective_transform';
import {VerticalPerspectiveCameraHelper} from './geo/projection/vertical_perspective_camera_helper';
import {SymbolBucket, SymbolBuffers, CollisionBuffers} from './data/bucket/symbol_bucket';
import {BackgroundStyleLayer} from './style/style_layer/background_style_layer';
import {CircleStyleLayer} from './style/style_layer/circle_style_layer';
import {ColorReliefStyleLayer} from './style/style_layer/color_relief_style_layer';
import {FillExtrusionStyleLayer} from './style/style_layer/fill_extrusion_style_layer';
import {FillStyleLayer} from './style/style_layer/fill_style_layer';
import {HeatmapStyleLayer} from './style/style_layer/heatmap_style_layer';
import {HillshadeStyleLayer} from './style/style_layer/hillshade_style_layer';
import {LineStyleLayer} from './style/style_layer/line_style_layer';
import {RasterStyleLayer} from './style/style_layer/raster_style_layer';
import {SymbolStyleLayer} from './style/style_layer/symbol_style_layer';
import {CircleBucket} from './data/bucket/circle_bucket';
import {FillBucket} from './data/bucket/fill_bucket';
import {FillExtrusionBucket} from './data/bucket/fill_extrusion_bucket';
import {HeatmapBucket} from './data/bucket/heatmap_bucket';
import {LineBucket} from './data/bucket/line_bucket';
import {register} from './util/web_worker_transfer';

// ===== LAYER FEATURES =====

/**
 * Registers the Background layer feature.
 * Enables rendering of solid color or pattern backgrounds.
 */
export function registerBackground() {
    registry.layer.background = BackgroundStyleLayer;
    registry.draw.background = drawBackground;
    registry.shader.background = prepare(backgroundFrag, backgroundVert);
    registry.shader.backgroundPattern = prepare(backgroundPatternFrag, backgroundPatternVert);
}

/**
 * Registers the Circle layer feature.
 * Enables rendering of circle markers.
 */
export function registerCircle() {
    if (registry.bucket.circle) return;
    registry.layer.circle = CircleStyleLayer;
    registry.draw.circle = drawCircles;
    registry.shader.circle = prepare(circleFrag, circleVert);
    registry.bucket.circle = CircleBucket;
    register('CircleBucket', CircleBucket, {omit: ['layers']});
}

/**
 * Registers the Fill layer feature.
 * Enables rendering of filled polygons with optional patterns and outlines.
 */
export function registerFill() {
    if (registry.bucket.fill) return;
    registry.layer.fill = FillStyleLayer;
    registry.draw.fill = drawFill;
    registry.shader.fill = prepare(fillFrag, fillVert);
    registry.shader.fillOutline = prepare(fillOutlineFrag, fillOutlineVert);
    registry.shader.fillPattern = prepare(fillPatternFrag, fillPatternVert);
    registry.shader.fillOutlinePattern = prepare(fillOutlinePatternFrag, fillOutlinePatternVert);
    registry.bucket.fill = FillBucket;
    register('FillBucket', FillBucket, {omit: ['layers', 'patternFeatures']});
}

/**
 * Registers the Fill-Extrusion layer feature.
 * Enables rendering of extruded 3D polygons (buildings).
 */
export function registerFillExtrusion() {
    if (registry.bucket['fill-extrusion']) return;
    registry.layer['fill-extrusion'] = FillExtrusionStyleLayer;
    registry.draw['fill-extrusion'] = drawFillExtrusion;
    registry.shader.fillExtrusion = prepare(fillExtrusionFrag, fillExtrusionVert);
    registry.shader.fillExtrusionPattern = prepare(fillExtrusionPatternFrag, fillExtrusionPatternVert);
    registry.bucket['fill-extrusion'] = FillExtrusionBucket;
    register('FillExtrusionBucket', FillExtrusionBucket, {omit: ['layers', 'features']});
}

/**
 * Registers the Heatmap layer feature.
 * Enables rendering of data density heatmaps.
 */
export function registerHeatmap() {
    if (registry.bucket.heatmap) return;
    registry.layer.heatmap = HeatmapStyleLayer;
    registry.draw.heatmap = drawHeatmap;
    registry.shader.heatmap = prepare(heatmapFrag, heatmapVert);
    registry.shader.heatmapTexture = prepare(heatmapTextureFrag, heatmapTextureVert);
    registry.bucket.heatmap = HeatmapBucket;
    register('HeatmapBucket', HeatmapBucket, {omit: ['layers']});
}

/**
 * Registers the Hillshade layer feature.
 * Enables rendering of hillshade relief from DEM data.
 */
export function registerHillshade() {
    registry.layer.hillshade = HillshadeStyleLayer;
    registry.draw.hillshade = drawHillshade;
    registry.shader.hillshade = prepare(hillshadeFrag, hillshadeVert);
    registry.shader.hillshadePrepare = prepare(hillshadePrepareFrag, hillshadePrepareVert);
}

/**
 * Registers the Line layer feature.
 * Enables rendering of lines with various styles (solid, gradient, pattern, SDF).
 */
export function registerLine() {
    if (registry.bucket.line) return;
    registry.layer.line = LineStyleLayer;
    registry.draw.line = drawLine;
    registry.shader.line = prepare(lineFrag, lineVert);
    registry.shader.lineGradient = prepare(lineGradientFrag, lineGradientVert);
    registry.shader.linePattern = prepare(linePatternFrag, linePatternVert);
    registry.shader.lineSDF = prepare(lineSDFFrag, lineSDFVert);
    registry.shader.lineGradientSDF = prepare(lineGradientSDFFrag, lineGradientSDFVert);
    registry.bucket.line = LineBucket;
    register('LineBucket', LineBucket, {omit: ['layers', 'patternFeatures']});
}

/**
 * Registers the Raster layer feature.
 * Enables rendering of raster tile images.
 */
export function registerRaster() {
    registry.layer.raster = RasterStyleLayer;
    registry.draw.raster = drawRaster;
    registry.shader.raster = prepare(rasterFrag, rasterVert);
}

/**
 * Registers the Color-Relief layer feature.
 * Enables rendering of color relief from DEM data.
 */
export function registerColorRelief() {
    registry.layer['color-relief'] = ColorReliefStyleLayer;
    registry.draw['color-relief'] = drawColorRelief;
    registry.shader['colorRelief'] = prepare(colorReliefFrag, colorReliefVert);
}

/**
 * Registers the Symbol layer feature.
 * Enables rendering of text labels and icons.
 * This is the most complex feature with additional dependencies.
 */
export function registerSymbol() {
    if (registry.bucket.symbol) return;
    registry.layer.symbol = SymbolStyleLayer;

    // Symbol draw function needs special handling with variable offsets
    registry.draw.symbol = (painter, sourceCache, layer, coords, renderOptions) => {
        const variableOffsets = painter.style?.placement?.variableOffsets;
        if (variableOffsets) {
            drawSymbols(painter, sourceCache, layer as any, coords, variableOffsets, renderOptions);
        }
    };

    // Symbol shaders
    registry.shader.symbolIcon = prepare(symbolIconFrag, symbolIconVert);
    registry.shader.symbolSDF = prepare(symbolSDFFrag, symbolSDFVert);
    registry.shader.symbolTextAndIcon = prepare(symbolTextAndIconFrag, symbolTextAndIconVert);
    registry.shader.collisionBox = prepare(collisionBoxFrag, collisionBoxVert);
    registry.shader.collisionCircle = prepare(collisionCircleFrag, collisionCircleVert);

    // Symbol bucket
    registry.bucket.symbol = SymbolBucket;

    // Register for web worker transfer
    register('SymbolBuffers', SymbolBuffers);
    register('CollisionBuffers', CollisionBuffers);
    register('SymbolBucket', SymbolBucket, {
        omit: ['layers', 'collisionBoxArray', 'features', 'compareText']
    });

    // Symbol dependencies
    registry.symbol.SymbolBucket = SymbolBucket;
    registry.symbol.CrossTileSymbolIndex = CrossTileSymbolIndex;
    registry.symbol.PauseablePlacement = PauseablePlacement;
    registry.symbol.performSymbolLayout = performSymbolLayout;
}

/**
 * Registers the Terrain feature.
 * Enables 3D terrain rendering from DEM data.
 */
export function registerTerrain() {
    registry.shader.terrain = prepare(terrainFrag, terrainVert);
    registry.shader.terrainDepth = prepare(terrainDepthFrag, terrainVertDepth);
    registry.shader.terrainCoords = prepare(terrainCoordsFrag, terrainVertCoords);

    registry.terrain.drawTerrain = drawTerrain;
    registry.terrain.drawDepth = drawDepth;
    registry.terrain.drawCoords = drawCoords;
}

// ===== UTILITY SHADERS =====

/**
 * Registers utility shaders used by the rendering system.
 * These are system-level shaders not tied to specific layer types.
 */
export function registerUtilityShaders() {
    registry.shader.atmosphere = prepare(atmosphereFrag, atmosphereVert);
    registry.shader.clippingMask = prepare(clippingMaskFrag, clippingMaskVert);
    registry.shader.debug = prepare(debugFrag, debugVert);
    registry.shader.depth = prepare(clippingMaskFrag, depthVert);
    registry.shader.prelude = prepare(preludeFrag, preludeVert);
    registry.shader.projectionErrorMeasurement = prepare(projectionErrorMeasurementFrag, projectionErrorMeasurementVert);
    registry.shader.projectionMercator = prepare('', projectionMercatorVert);
    registry.shader.projectionGlobe = prepare('', projectionGlobeVert);
    registry.shader.sky = prepare(skyFrag, skyVert);
}

// ===== SOURCES =====

/**
 * Registers the Canvas source.
 * Enables using an HTML canvas element as a map layer source.
 */
export function registerCanvasSource() {
    registry.source.canvas = CanvasSource;
}

/**
 * Registers the GeoJSON source.
 * Enables loading GeoJSON data as a map layer source.
 */
export function registerGeoJSONSource() {
    registry.source.geojson = GeoJSONSource;
}

/**
 * Registers the Image source.
 * Enables using a single image positioned at geographic coordinates.
 */
export function registerImageSource() {
    registry.source.image = ImageSource;
}

/**
 * Registers the Raster-DEM source.
 * Enables loading raster DEM (Digital Elevation Model) tiles for terrain and hillshade.
 */
export function registerRasterDEMSource() {
    registry.source['raster-dem'] = RasterDEMTileSource;
}

/**
 * Registers the Raster source.
 * Enables loading raster tile images (satellite, aerial photos, etc.).
 */
export function registerRasterSource() {
    registry.source.raster = RasterTileSource;
}

/**
 * Registers the Vector source.
 * Enables loading vector tiles in MVT format.
 */
export function registerVectorSource() {
    registry.source.vector = VectorTileSource;
}

/**
 * Registers the Video source.
 * Enables using a video element as a map layer source.
 */
export function registerVideoSource() {
    registry.source.video = VideoSource;
}

// ===== TILE DECODERS =====

/**
 * Registers the MLT (MapLibre Tiles) decoder.
 * Enables reading tiles served with `encoding: 'mlt'`; MVT tiles need no decoder.
 *
 * The decoder pulls in `@maplibre/mlt`, which uses BigInt literals — syntax that
 * pre-2020 engines cannot parse. Leave it unregistered to keep it out of the
 * bundle, and out of a legacy build's reach.
 */
export function registerMLTDecoder() {
    registry.tileDecoder.mlt = MLTVectorTile;
}

// ===== PROJECTIONS =====

/**
 * Registers Mercator projection support.
 * Enables flat 2D map rendering with mercator projection.
 * This is the most common projection for 2D maps.
 *
 * Note: Mercator is also the built-in fallback, so calling this
 * function is optional unless you need explicit mercator projection
 * selection in the style spec.
 */
export function registerMercatorProjection() {
    registry.projection.mercator =  {
        projection: MercatorProjection,
        transform: MercatorTransform,
        cameraHelper: MercatorCameraHelper,
    };
}

/**
 * Registers Vertical Perspective projection support.
 * Enables pure 3D globe rendering at all zoom levels.
 * This projection always shows the earth as a sphere.
 */
export function registerVerticalPerspectiveProjection() {
    registry.projection['vertical-perspective'] = {
        projection: VerticalPerspectiveProjection,
        transform: VerticalPerspectiveTransform,
        cameraHelper: VerticalPerspectiveCameraHelper,
    };
}

/**
 * Registers Globe projection support.
 * Enables smart globe view that interpolates between 3D globe and flat mercator
 * based on zoom level (globe when zoomed out, mercator when zoomed in).
 *
 * This internally registers both mercator and vertical-perspective projections
 * since globe interpolates between them.
 */
export function registerGlobeProjection() {
    // Globe relies on both mercator and vertical-perspective
    registerMercatorProjection();
    registerVerticalPerspectiveProjection();

    registry.projection.globe = {
        projection: GlobeProjection,
        transform: GlobeTransform,
        cameraHelper: GlobeCameraHelper
    };
}
