// Unit-test setup: populate the feature registry the way the full bundle does.
// The render core reaches draws, shaders, sources, layers, and projections
// through `registry.*`, so tests that construct a Map/Painter/Style need every
// feature registered up front, otherwise projection setup and program creation
// throw on missing entries.
//
// We call the register* functions directly (rather than importing src/index)
// so the setup only pulls in the feature module graph — not the whole public
// API — which keeps the blast radius small for tests that vi.mock unrelated
// modules (e.g. UI controls). The register* functions are idempotent, so tests
// that also import src/index don't double-register.
import {
    registerCanvasSource,
    registerGeoJSONSource,
    registerImageSource,
    registerRasterDEMSource,
    registerRasterSource,
    registerVectorSource,
    registerVideoSource,
    registerMLTDecoder,
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
    registerUtilityShaders,
    registerGlobeProjection,
    registerTerrain
} from '../../../src/features';

registerCanvasSource();
registerGeoJSONSource();
registerImageSource();
registerRasterDEMSource();
registerRasterSource();
registerVectorSource();
registerVideoSource();
registerMLTDecoder();

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
registerUtilityShaders();
