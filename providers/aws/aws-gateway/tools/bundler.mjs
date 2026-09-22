import { bundlePackage } from '../../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Client HTTP package.
bundlePackage('src/client-http.ts', 'dist/client-http.mjs');

// Client WS package.
bundlePackage('src/client-ws.ts', 'dist/client-ws.mjs');
