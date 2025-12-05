import {registry} from '../../registry';

import type {ProjectionSpecification} from '@maplibre/maplibre-gl-style-spec';
import type {Projection} from './projection';
import type {ITransform} from '../transform_interface';
import type {ICameraHelper} from './camera_helper';

export function createProjectionFromName(name: ProjectionSpecification['type']): {
    projection: Projection;
    transform: ITransform;
    cameraHelper: ICameraHelper;
} {
    // Handle array type (for interpolated projections) - use globe factory
    if (Array.isArray(name)) {
        const globeProjection = new registry.projection.globe.projection({type: name});
        return {
            projection: globeProjection,
            transform: new registry.projection.globe.transform(),
            cameraHelper: new registry.projection.globe.cameraHelper(globeProjection),
        };
    }

    // Special handling for 'globe' - use default interpolation
    if (name === 'globe') {
        const globeProjection = new registry.projection.globe.projection({type: [
            'interpolate',
            ['linear'],
            ['zoom'],
            11,
            'vertical-perspective',
            12,
            'mercator'
        ]});
        return {
            projection: globeProjection,
            transform: new registry.projection.globe.transform(),
            cameraHelper: new registry.projection.globe.cameraHelper(globeProjection),
        };
    }

    // Check if projection is registered
    if(typeof name === 'string' && name in registry.projection){
        return {
            projection: new registry.projection[name].projection(),
            transform: new registry.projection[name].transform(),
            cameraHelper: new registry.projection[name].cameraHelper(),
        };
    }

    throw `Unknown projection name: ${name}. Falling back to mercator projection.`;
}
