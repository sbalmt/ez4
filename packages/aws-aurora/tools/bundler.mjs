import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs', 'esm');
bundlePackage('src/main.ts', 'dist/main.cjs', 'cjs');

// Client package.
bundlePackage('src/client.ts', 'dist/client.mjs', 'esm');
bundlePackage('src/client.ts', 'dist/client.cjs', 'cjs');
