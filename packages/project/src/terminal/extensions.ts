import type { ResolveHook } from 'node:module';

import { existsSync } from 'node:fs';
import { extname } from 'node:path';

export const resolve: ResolveHook = (specifier, context, defaultResolve) => {
  if (!context.parentURL?.includes('node_modules')) {
    const filePath = resolveFilePath(specifier);

    if (filePath) {
      return defaultResolve(filePath, context);
    }
  }

  return defaultResolve(specifier, context);
};

const resolveFilePath = (specifier: string) => {
  if (specifier.startsWith('file://')) {
    return undefined;
  }

  if (specifier.endsWith('.js') && !existsSync(specifier)) {
    return specifier.replace(/\.js$/, '.ts');
  }

  if (specifier.startsWith('.') && !extname(specifier)) {
    return `${specifier}.ts`;
  }

  return undefined;
};
