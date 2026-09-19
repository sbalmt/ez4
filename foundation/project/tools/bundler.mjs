import { bundlePackage } from '../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs');

// Library package.
bundlePackage('src/library.ts', 'dist/library.mjs');

// CLI components.
bundlePackage('src/terminal/application.ts', 'bin/application.mjs');
bundlePackage('src/terminal/extensions.ts', 'bin/extensions.mjs');

// CLI
bundlePackage('src/cli.ts', 'bin/cli.mjs', {
  target: 'node12'
});
