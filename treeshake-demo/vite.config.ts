import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig({
    root: '.',
    appType: 'mpa',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                full: resolve(__dirname, 'full.html'),
                core: resolve(__dirname, 'core.html'),
            },
        },
        minify: true,
        sourcemap: true,
    },
    resolve: {
        alias: {
            'maplibre-gl/core': resolve(__dirname, '../dist/maplibre-gl-core-dev.mjs'),
            'maplibre-gl': resolve(__dirname, '../dist/maplibre-gl-dev.mjs'),
        },
    },
});
