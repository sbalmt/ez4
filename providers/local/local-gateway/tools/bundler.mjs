import { bundlePackage } from '../../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs', 'esm');
bundlePackage('src/main.ts', 'dist/main.cjs', 'cjs');

// Tester package.
bundlePackage('src/test.ts', 'dist/test.mjs', 'esm');
bundlePackage('src/test.ts', 'dist/test.cjs', 'cjs');
