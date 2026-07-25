import { basename } from 'node:path';

import { bundlePackage } from '../../../tools/esbuild.mjs';

bundlePackage('src/extension.ts', 'dist/extension.js', 'cjs', {
  packages: 'bundle',
  external: ['vscode']
});

bundlePackage('src/webview.ts', 'dist/webview.js', 'iife', {
  packages: 'bundle',
  platform: 'browser',
  sourcemap: false,
  loader: {
    '.ttf': 'file'
  }
});

// Monaco Editor dependencies
for (const dependencyPath of ['language/json/json.worker.js', 'editor/editor.worker.js'])
  bundlePackage(`../../node_modules/monaco-editor/esm/vs/${dependencyPath}`, `dist/${basename(dependencyPath)}`, 'iife', {
    packages: 'bundle',
    platform: 'browser',
    sourcemap: false
  });
