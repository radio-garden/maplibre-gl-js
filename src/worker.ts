// Full-featured worker with all layers pre-registered
// This is the convenience export for users who want everything

import {
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
} from './features';

// Register all layer types
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

// Export the worker
export {default} from './source/worker';
