import { basename } from 'node:path';

import { bundlePackage } from '../../../tools/esbuild.mjs';

bundlePackage('src/extension.ts', 'dist/extension.js', {
  format: 'cjs',
  packages: 'bundle',
  external: ['vscode']
});

bundlePackage('src/webview.ts', 'dist/webview.js', {
  format: 'iife',
  packages: 'bundle',
  platform: 'browser',
  sourcemap: false,
  loader: {
    '.ttf': 'file'
  }
});

// Monaco Editor dependencies
for (const dependencyPath of ['language/json/json.worker.js', 'editor/editor.worker.js']) {
  const fromPath = `../../node_modules/monaco-editor/esm/vs/${dependencyPath}`;
  const toPath = `dist/${basename(dependencyPath)}`;

  bundlePackage(fromPath, toPath, {
    format: 'iife',
    packages: 'bundle',
    platform: 'browser',
    sourcemap: false
  });
}
