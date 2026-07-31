import {registry} from '../registry';

import type {TileDecoderRegistry} from '../registry';
import type {VectorTileLike} from '@maplibre/vt-pbf';

/**
 * Decodes a raw tile buffer with the decoder registered for its encoding.
 *
 * Decoders are opt-in, like sources and layers: `registerMLTDecoder()` installs
 * the MLT decoder. Leaving it unregistered keeps `@maplibre/mlt` out of the
 * bundle entirely.
 *
 * @param encoding - the tile encoding, as declared by the source
 * @param rawData - the raw tile buffer
 * @returns the decoded tile
 */
export function decodeTile(encoding: string, rawData: ArrayBuffer): VectorTileLike {
    const Decoder = registry.tileDecoder[encoding as keyof TileDecoderRegistry];
    if (!Decoder) {
        throw new Error(`No tile decoder is registered for the "${encoding}" encoding.`);
    }
    return new Decoder(rawData);
}
