import { bundlePackage } from '../../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Tester package.
bundlePackage('src/tester.ts', 'dist/tester.mjs');

// Runner package.
bundlePackage('src/runner.ts', 'dist/runner.mjs');

// Worker package.
bundlePackage('src/worker.ts', 'dist/worker.mjs');

// Client package.
bundlePackage('src/client.ts', 'dist/client.mjs');
