import {CustomStyleLayer, type CustomLayerInterface} from './style_layer/custom_style_layer';
import {registry} from '../registry';
import {warnOnce} from '../util/util';

import type {LayerSpecification} from '@maplibre/maplibre-gl-style-spec';

export function createStyleLayer(layer: LayerSpecification | CustomLayerInterface, globalState: Record<string, any>) {
    if (layer.type === 'custom') {
        return new CustomStyleLayer(layer, globalState);
    }

    // Try to get layer class from registry
    const LayerClass = registry.layer[layer.type];
    if (LayerClass) {
        return new LayerClass(layer as LayerSpecification, globalState);
    }

    // Warn if layer type not registered
    warnOnce(`Layer type '${layer.type}' is not registered. Import the corresponding layer module to enable it.`);
    return null;
}

