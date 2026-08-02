import { bundlePackage } from '../../../../tools/esbuild.mjs';

// Default package.
bundlePackage('src/main.ts', 'dist/main.mjs', 'esm');
bundlePackage('src/main.ts', 'dist/main.cjs', 'cjs');

// Client package.
bundlePackage('src/client.ts', 'dist/client.mjs', 'esm');
bundlePackage('src/client.ts', 'dist/client.cjs', 'cjs');

// Client API package.
bundlePackage('src/client-api.ts', 'dist/client-api.mjs', 'esm');
bundlePackage('src/client-api.ts', 'dist/client-api.cjs', 'cjs');

// Client Native package.
bundlePackage('src/client-native.ts', 'dist/client-native.mjs', 'esm');
bundlePackage('src/client-native.ts', 'dist/client-native.cjs', 'cjs');
