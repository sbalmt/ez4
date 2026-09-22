import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Library package.
bundlePackage('src/library.ts', 'dist/library.mjs');

// Driver package.
bundlePackage('src/driver.ts', 'dist/driver.mjs');

// Utils package.
bundlePackage('src/utils.ts', 'dist/utils.mjs');
