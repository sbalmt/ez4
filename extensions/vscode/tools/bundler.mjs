import { bundlePackage } from '../../../tools/esbuild.mjs';

bundlePackage('src/main.ts', 'dist/main.js', 'cjs');
