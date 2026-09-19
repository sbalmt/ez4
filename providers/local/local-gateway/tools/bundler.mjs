import { bundlePackage } from '../../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Tester package.
bundlePackage('src/test.ts', 'dist/test.mjs');
