import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/library.ts', 'dist/library.mjs');
