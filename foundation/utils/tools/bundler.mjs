import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs', 'esm');
bundlePackage('src/main.ts', 'dist/main.cjs', 'cjs');

// Browser package.
bundlePackage('src/browser.ts', 'dist/browser.mjs', 'esm');
