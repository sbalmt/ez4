import { bundlePackage } from '../../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Worker package.
bundlePackage('src/worker.ts', 'dist/worker.mjs');

// Client package.
bundlePackage('src/client.ts', 'dist/client.mjs');
