import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs', 'esm');
bundlePackage('src/main.ts', 'dist/main.cjs', 'cjs');

// Library package.
bundlePackage('src/library.ts', 'dist/library.mjs', 'esm');
bundlePackage('src/library.ts', 'dist/library.cjs', 'cjs');

// Utils package.
bundlePackage('src/utils.ts', 'dist/utils.mjs', 'esm');
bundlePackage('src/utils.ts', 'dist/utils.cjs', 'cjs');
