import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Library package.
bundlePackage('src/library.ts', 'dist/library.mjs');

// Tester package.
bundlePackage('src/tester.ts', 'dist/tester.mjs');

// Worker package.
bundlePackage('src/worker.ts', 'dist/worker.mjs');
