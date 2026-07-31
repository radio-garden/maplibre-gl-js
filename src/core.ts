import packageJSON from '../package.json' with {type: 'json'};
import {Map, type MapOptions, type WebGLContextAttributesWithType} from './ui/map';
import {Camera} from './ui/camera';
import {NavigationControl, type NavigationControlOptions} from './ui/control/navigation_control';
import {GeolocateControl, type GeolocateControlOptions} from './ui/control/geolocate_control';
import {AttributionControl, defaultAttributionControlOptions, type AttributionControlOptions} from './ui/control/attribution_control';
import {LogoControl, type LogoControlOptions} from './ui/control/logo_control';
import {ScaleControl, type ScaleControlOptions, type Unit} from './ui/control/scale_control';
import {FullscreenControl, type FullscreenControlOptions} from './ui/control/fullscreen_control';
import {TerrainControl} from './ui/control/terrain_control';
import {GlobeControl} from './ui/control/globe_control';
import {type Offset, Popup, type PopupOptions} from './ui/popup';
import {type Alignment, Marker, type MarkerOptions} from './ui/marker';
import {type AddLayerObject, type FeatureIdentifier, Style, type StyleOptions, type StyleSetterOptions, type StyleSwapOptions, type TransformStyleFunction} from './style/style';
import {LngLat, type LngLatLike} from './geo/lng_lat';
import {LngLatBounds, type LngLatBoundsLike} from './geo/lng_lat_bounds';
import Point from '@mapbox/point-geometry';
import {MercatorCoordinate} from './geo/mercator_coordinate';
import {Evented, ErrorEvent, Event, type Listener} from './util/evented';
import {type AddProtocolAction, config} from './util/config';
import {rtlMainThreadPluginFactory} from './source/rtl_text_plugin_main_thread';
import {WorkerPool} from './util/worker_pool';
import {prewarm, clearPrewarmedResources} from './util/global_worker_pool';
import {AJAXError, getJSON, type ExpiryData, type GetResourceResponse, type RequestParameters} from './util/ajax';
import type {SetClusterOptions} from './source/geojson_source';
import type {CanvasSourceSpecification} from './source/canvas_source';
import type {CanonicalTileRange, Coordinates, UpdateImageOptions} from './source/image_source';
import {type Source, type SourceClass, addSourceType} from './source/source';
import {addProtocol, removeProtocol} from './source/protocol_crud';
import {type Dispatcher, getGlobalDispatcher} from './util/dispatcher';
import {EdgeInsets, type PaddingOptions} from './geo/edge_insets';
import {type MapTerrainEvent, type MapStyleImageMissingEvent, type MapStyleDataEvent, type MapSourceDataEvent, type MapLibreZoomEvent, type MapLibreEvent, type MapLayerTouchEvent, type MapLayerMouseEvent, type MapLayerEventType, type MapEventType, type MapDataEvent, type MapContextEvent, MapWheelEvent, MapTouchEvent, MapMouseEvent, type MapSourceDataType, type MapProjectionEvent} from './ui/events';
import {BoxZoomHandler} from './ui/handler/box_zoom';
import {DragRotateHandler} from './ui/handler/shim/drag_rotate';
import {DragPanHandler, type DragPanOptions} from './ui/handler/shim/drag_pan';
import {ScrollZoomHandler} from './ui/handler/scroll_zoom';
import {TwoFingersTouchZoomRotateHandler} from './ui/handler/shim/two_fingers_touch';
import {Hash} from './ui/hash';
import {CooperativeGesturesHandler, type GestureOptions} from './ui/handler/cooperative_gestures';
import {DoubleClickZoomHandler} from './ui/handler/shim/dblclick_zoom';
import {KeyboardHandler} from './ui/handler/keyboard';
import {TwoFingersTouchPitchHandler, TwoFingersTouchRotateHandler, TwoFingersTouchZoomHandler, type AroundCenterOptions} from './ui/handler/two_fingers_touch';
import {MessageType, type ActorMessage, type RequestResponseMessageMap} from './util/actor_messages';
import {createTileMesh, type CreateTileMeshOptions, type IndicesType, type TileMesh} from './util/create_tile_mesh';
import type {ControlPosition, IControl} from './ui/control/control';
import type {CustomRenderMethod, CustomLayerInterface, CustomRenderMethodInput} from './style/style_layer/custom_style_layer';
import type {AnimationOptions, CameraForBoundsOptions, CameraOptions, CameraUpdateTransformFunction, CenterZoomBearing, EaseToOptions, FitBoundsOptions, FlyToOptions, JumpToOptions, PointLike} from './ui/camera';
import type {DistributiveKeys, DistributiveOmit, GeoJSONFeature, MapGeoJSONFeature} from './util/vectortile_to_geojson';
import {HandlerManager, type Handler, type HandlerResult} from './ui/handler_manager';
import {extend, isImageBitmap, pick, uniqueId, warnOnce, type Complete, type RequireAtLeastOne, type Subscription} from './util/util';
import {coveringTiles, createCalculateTileZoomFunction, type CalculateTileZoomFunction, type CoveringTilesOptions} from './geo/projection/covering_tiles';
import type {StyleImage, StyleImageData, StyleImageInterface, StyleImageMetadata, TextFit} from './style/style_image';
import type {StyleLayer} from './style/style_layer';
import type {Tile} from './tile/tile';
import type {GeoJSONFeatureDiff, GeoJSONFeatureId, GeoJSONSourceDiff} from './source/geojson_source_diff';
import type {QueryRenderedFeaturesOptions, QuerySourceFeatureOptions} from './source/query_features';
import {RequestManager, ResourceType, type RequestTransformFunction} from './util/request_manager';
import {CanonicalTileID, OverscaledTileID} from './tile/tile_id';
import type {PositionAnchor} from './ui/anchor';
import type {ProjectionData} from './geo/projection/projection_data';
import type {WorkerTileResult} from './source/worker_source';
import type {Actor, IActor} from './util/actor';
import type {Bucket} from './data/bucket';
import type {CollisionBoxArray} from './data/array_types.g';
import {RGBAImage, type AlphaImage} from './util/image';
import type {GlyphPosition, GlyphPositions} from './render/glyph_atlas';
import type {ImageAtlas} from './render/image_atlas';
import type {StyleGlyph} from './style/style_glyph';
import type {FeatureIndex} from './data/feature_index';
import {Painter} from './render/painter';
import {type TaskID, TaskQueue} from './util/task_queue';
import {defaultLocale} from './ui/default_locale';
import {ImageRequest} from './util/image_request';
import {DOM} from './util/dom';
import {type ITransform} from './geo/transform_interface';
import {type ICameraHelper} from './geo/projection/camera_helper';
import {MercatorTransform} from './geo/projection/mercator_transform';
import {MercatorCameraHelper} from './geo/projection/mercator_camera_helper';
import {browser} from './util/browser';
import {EvaluationParameters} from './style/evaluation_parameters';
import {isAbortError} from './util/abort_error';
import {isFramebufferNotCompleteError} from './util/framebuffer_error';
import {RenderToTexture} from './webgl/render_to_texture';
import {Terrain} from './render/terrain';
import {throttle} from './util/throttle';
import {CanvasSource} from './source/canvas_source';
import {GeoJSONSource} from './source/geojson_source';
import {ImageSource} from './source/image_source';
import {RasterDEMTileSource} from './source/raster_dem_tile_source';
import {RasterTileSource} from './source/raster_tile_source';
import {VectorTileSource} from './source/vector_tile_source';
import {VideoSource} from './source/video_source';
import Worker from './source/worker';

export {
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
    registerTerrain,
    // Projections
    registerMercatorProjection,
    registerVerticalPerspectiveProjection,
    registerGlobeProjection,
} from './features';

export type * from '@maplibre/maplibre-gl-style-spec';

const version = packageJSON.version;

function setRTLTextPlugin(pluginURL: string, lazy: boolean): Promise<void> {
    return rtlMainThreadPluginFactory().setRTLTextPlugin(pluginURL, lazy);
}
function getRTLTextPluginStatus(): string {
    return rtlMainThreadPluginFactory().getRTLTextPluginStatus();
}
function getVersion() { return version; }
function getWorkerCount() { return WorkerPool.workerCount; }
function setWorkerCount(count: number) { WorkerPool.workerCount = count; }
function getMaxParallelImageRequests() { return config.MAX_PARALLEL_IMAGE_REQUESTS; }
function setMaxParallelImageRequests(numRequests: number) { config.MAX_PARALLEL_IMAGE_REQUESTS = numRequests; }
function getWorkerUrl() { return config.WORKER_URL; }
function setWorkerUrl(value: string, module = false) {
    config.WORKER_URL = value;
    config.WORKER_IS_MODULE = module;
}
function importScriptInWorkers(workerUrl: string) { return getGlobalDispatcher().broadcast(MessageType.importScript, workerUrl); }

export {
    browser,
    Camera,
    CanonicalTileID,
    coveringTiles,
    createCalculateTileZoomFunction,
    defaultAttributionControlOptions,
    defaultLocale,
    DOM,
    ErrorEvent,
    EvaluationParameters,
    extend,
    getJSON,
    HandlerManager,
    ImageRequest,
    isAbortError,
    isFramebufferNotCompleteError,
    isImageBitmap,
    MercatorCameraHelper,
    MercatorTransform,
    packageJSON,
    Painter,
    pick,
    RenderToTexture,
    RequestManager,
    ResourceType,
    RGBAImage,
    TaskQueue,
    Terrain,
    throttle,
    uniqueId,
    warnOnce,
    type ICameraHelper,
    type ITransform,
    type TaskID,
    //
    Map,
    NavigationControl,
    GeolocateControl,
    AttributionControl,
    LogoControl,
    ScaleControl,
    FullscreenControl,
    TerrainControl,
    GlobeControl,
    Hash,
    Popup,
    Marker,
    Style,
    LngLat,
    LngLatBounds,
    Point,
    MercatorCoordinate,
    Evented,
    Event,
    AJAXError,
    config,
    CanvasSource,
    GeoJSONSource,
    ImageSource,
    RasterDEMTileSource,
    RasterTileSource,
    VectorTileSource,
    VideoSource,
    Worker,
    EdgeInsets,
    BoxZoomHandler,
    DragRotateHandler,
    DragPanHandler,
    ScrollZoomHandler,
    TwoFingersTouchZoomRotateHandler,
    CooperativeGesturesHandler,
    DoubleClickZoomHandler,
    KeyboardHandler,
    TwoFingersTouchZoomHandler,
    TwoFingersTouchRotateHandler,
    TwoFingersTouchPitchHandler,
    MapWheelEvent,
    MapTouchEvent,
    MapMouseEvent,
    type Handler,
    type RequireAtLeastOne,
    type CameraUpdateTransformFunction,
    type CustomRenderMethod,
    type CalculateTileZoomFunction,
    type MapSourceDataType,
    type TileMesh,
    type CreateTileMeshOptions,
    type ControlPosition,
    type Subscription,
    type Complete,
    type CameraOptions,
    type CenterZoomBearing,
    type StyleImage,
    type StyleImageData,
    type StyleImageMetadata,
    type StyleLayer,
    type GetResourceResponse,
    type MapGeoJSONFeature,
    type Alignment,
    type AddProtocolAction,
    type SourceClass,
    type IndicesType,
    type AttributionControlOptions,
    type CanonicalTileRange,
    type Tile,
    type Listener,
    type Coordinates,
    type UpdateImageOptions,
    type DragPanOptions,
    type FullscreenControlOptions,
    type SetClusterOptions,
    type GeoJSONSourceDiff,
    type GeolocateControlOptions,
    type LogoControlOptions,
    type StyleImageInterface,
    type AddLayerObject,
    type StyleSetterOptions,
    type CameraForBoundsOptions,
    type EaseToOptions,
    type FitBoundsOptions,
    type FlyToOptions,
    type FeatureIdentifier,
    type JumpToOptions,
    type QueryRenderedFeaturesOptions,
    type QuerySourceFeatureOptions,
    type AnimationOptions,
    type StyleSwapOptions,
    type StyleOptions,
    type RequestTransformFunction,
    type MarkerOptions,
    type NavigationControlOptions,
    type PopupOptions,
    type Offset,
    OverscaledTileID,
    type ScaleControlOptions,
    type Unit,
    type AroundCenterOptions,
    type HandlerResult,
    type CustomRenderMethodInput,
    type ExpiryData,
    type PositionAnchor,
    type ProjectionData,
    type GeoJSONFeatureId,
    type GeoJSONFeatureDiff,
    type TextFit,
    type TransformStyleFunction,
    type DistributiveOmit,
    type DistributiveKeys,
    type RequestParameters,
    type RequestResponseMessageMap,
    type WorkerTileResult,
    type Dispatcher,
    type Actor,
    type IActor,
    type ActorMessage,
    type Bucket,
    type CollisionBoxArray,
    type FeatureIndex,
    type AlphaImage,
    type GlyphPositions,
    type GlyphPosition,
    type ImageAtlas,
    type MessageType,
    type StyleGlyph,
    type MapOptions,
    type GestureOptions,
    type WebGLContextAttributesWithType,
    type IControl,
    type CustomLayerInterface,
    type CanvasSourceSpecification,
    type PaddingOptions,
    type LngLatLike,
    type PointLike,
    type LngLatBoundsLike,
    type Source,
    type MapProjectionEvent,
    type MapTerrainEvent,
    type MapStyleImageMissingEvent,
    type MapStyleDataEvent,
    type MapSourceDataEvent,
    type MapLibreZoomEvent,
    type MapLibreEvent,
    type MapLayerTouchEvent,
    type MapLayerMouseEvent,
    type MapLayerEventType,
    type MapEventType,
    type MapDataEvent,
    type MapContextEvent,
    type GeoJSONFeature,
    type CoveringTilesOptions,
    setRTLTextPlugin,
    getRTLTextPluginStatus,
    prewarm,
    clearPrewarmedResources,
    getVersion,
    getWorkerCount,
    setWorkerCount,
    getMaxParallelImageRequests,
    setMaxParallelImageRequests,
    getWorkerUrl,
    setWorkerUrl,
    addProtocol,
    removeProtocol,
    addSourceType,
    importScriptInWorkers,
    createTileMesh
};
