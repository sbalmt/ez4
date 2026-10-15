import { bundlePackage } from '../../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Client package.
bundlePackage('src/client.ts', 'dist/client.mjs');
