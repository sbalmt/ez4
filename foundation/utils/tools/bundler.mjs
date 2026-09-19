import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Browser package.
bundlePackage('src/browser.ts', 'dist/browser.js');
