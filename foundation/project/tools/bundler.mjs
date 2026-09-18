import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs', 'esm');
bundlePackage('src/main.ts', 'dist/main.cjs', 'cjs');

// Library package.
bundlePackage('src/library.ts', 'dist/library.mjs', 'esm');
bundlePackage('src/library.ts', 'dist/library.cjs', 'cjs');

// CLI components.
bundlePackage('src/terminal/application.ts', 'bin/application.mjs', 'esm');
bundlePackage('src/terminal/extensions.ts', 'bin/extensions.mjs', 'esm');

// CLI
bundlePackage('src/cli.ts', 'bin/cli.mjs', 'esm', {
  target: 'node12'
});
