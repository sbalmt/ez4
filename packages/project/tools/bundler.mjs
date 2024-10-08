import { bundlePackage } from '../../../tools/esbuild.mjs';

// CLI package.
bundlePackage('src/cli.ts', 'bin/cli.mjs', 'esm');

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs', 'esm');
bundlePackage('src/main.ts', 'dist/main.cjs', 'cjs');

// Library package.
bundlePackage('src/library.ts', 'dist/library.mjs', 'esm');
bundlePackage('src/library.ts', 'dist/library.cjs', 'cjs');
