import { bundlePackage } from '../../../tools/esbuild.mjs';

bundlePackage('src/webview.ts', 'dist/webview.js', 'esm', { packages: 'bundle' });
bundlePackage('src/main.ts', 'dist/main.js', 'cjs');
