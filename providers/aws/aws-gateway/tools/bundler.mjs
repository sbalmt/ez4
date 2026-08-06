import { bundlePackage } from '../../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs', 'esm');
bundlePackage('src/main.ts', 'dist/main.cjs', 'cjs');

// Client HTTP package.
bundlePackage('src/client-http.ts', 'dist/client-http.mjs', 'esm');
bundlePackage('src/client-http.ts', 'dist/client-http.cjs', 'cjs');

// Client WS package.
bundlePackage('src/client-ws.ts', 'dist/client-ws.mjs', 'esm');
bundlePackage('src/client-ws.ts', 'dist/client-ws.cjs', 'cjs');
