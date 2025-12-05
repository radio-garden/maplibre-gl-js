# MapLibre Tree-shaking Build Comparison

## Bundle Sizes

| Build | Raw Size | Gzipped |
|-------|----------|---------|
| Full | 874.95 KB | 236.22 KB |
| Core | 580.06 KB | 159.53 KB |
| **Savings** | **294.89 KB (33.7%)** | **76.69 KB (32.5%)** |

## Summary

- The core build is **1.51x smaller** than the full build
- Tree-shaking saves **294.89 KB** (33.7%) raw, **76.69 KB** (32.5%) gzipped

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
