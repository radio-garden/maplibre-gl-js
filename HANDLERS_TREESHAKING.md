# Tree-Shakeable Handlers

MapLibre GL JS now supports tree-shaking for handlers, allowing you to include only the interaction handlers you need.

## Usage

### Full Bundle (Default - All Handlers)

```typescript
import { Map } from 'maplibre-gl';

const map = new Map({
  container: 'map',
  // All handlers available: scrollZoom, dragPan, dragRotate, etc.
});
```

### Minimal Bundle (Only Specific Handlers)

```typescript
// Import from 'maplibre-gl/core' instead of 'maplibre-gl'
// Then register only the handlers you need
import { Map } from 'maplibre-gl/core';
import 'maplibre-gl/handlers/scroll-zoom';
import 'maplibre-gl/handlers/drag-pan';

const map = new Map({
  container: 'map',
  // Only scrollZoom and dragPan are available
  scrollZoom: true,
  dragPan: true
});
```

## Available Handlers

- `maplibre-gl/handlers/scroll-zoom` - Mousewheel/trackpad zoom
- `maplibre-gl/handlers/drag-pan` - Mouse/touch drag to pan (includes mousePan and touchPan)
- `maplibre-gl/handlers/drag-rotate` - Right-click/Ctrl+drag rotate (includes mouse rotation/pitch/roll)
- `maplibre-gl/handlers/box-zoom` - Shift+drag box zoom
- `maplibre-gl/handlers/double-click-zoom` - Double-click to zoom (includes click and tap zoom)
- `maplibre-gl/handlers/touch-zoom-rotate` - Pinch zoom and rotate (includes touch zoom/rotate)
- `maplibre-gl/handlers/touch-pitch` - Two-finger pitch (3D tilt)
- `maplibre-gl/handlers/tap-drag-zoom` - Touch tap-and-drag zoom
- `maplibre-gl/handlers/keyboard` - Keyboard navigation (arrow keys, +/-)
- `maplibre-gl/handlers/cooperative-gestures` - "Use Ctrl+scroll to zoom" overlay

## Bundle Size Savings

Each handler is ~2-5KB minified. By importing only the handlers you need, you can save:

- **Basic map (pan + zoom only)**: ~35-40KB savings (excludes 8+ unused handlers)
- **Desktop-only map (no touch handlers)**: ~15-20KB savings
- **Static map (no interaction)**: ~45KB savings (excludes all handlers)

## Implementation Details

The handler system uses a global registry pattern with side-effect imports. When you import a handler module, it automatically registers itself with the HandlerManager. The Map class then initializes only the handlers that have been registered.

### Registry Pattern

```typescript
// Each handler module does this:
import { registerHandler } from '../handler_manager';
import { ScrollZoomHandler } from '../handler/scroll_zoom';

registerHandler('scrollZoom', (map, options, manager) => {
  const scrollZoom = map.scrollZoom = new ScrollZoomHandler(map, () => manager._triggerRenderFrame());
  manager._add('scrollZoom', scrollZoom, ['mousePan']);
  if (options.interactive && options.scrollZoom) {
    map.scrollZoom.enable(options.scrollZoom);
  }
});
```

This pattern ensures:
1. Handlers are only bundled if explicitly imported
2. No breaking changes to the Map API
3. TypeScript types remain intact
4. Full backwards compatibility when using default import
