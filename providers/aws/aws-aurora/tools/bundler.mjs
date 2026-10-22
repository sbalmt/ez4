import { bundlePackage } from '../../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Worker package.
bundlePackage('src/worker.ts', 'dist/worker.mjs');

// Client package.
bundlePackage('src/client.ts', 'dist/client.mjs');

// Client API package.
bundlePackage('src/client-api.ts', 'dist/client-api.mjs');

// Client Native package.
bundlePackage('src/client-native.ts', 'dist/client-native.mjs');
