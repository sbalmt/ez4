import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/library.ts', 'dist/library.mjs');

// Worker entrypoint.
bundlePackage('src/worker.ts', 'dist/worker.mjs');
