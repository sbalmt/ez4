import type { ResolveHook } from 'node:module';

import { existsSync } from 'node:fs';
import { extname } from 'node:path';

export const resolve: ResolveHook = (specifier, context, defaultResolve) => {
  const filePath = resolveFilePath(specifier);

  if (filePath) {
    return defaultResolve(filePath, context);
  }

  return defaultResolve(specifier, context);
};

const resolveFilePath = (specifier: string) => {
  if (!specifier.startsWith('file://')) {
    if (specifier.startsWith('.') && !extname(specifier)) {
      return `${specifier}.ts`;
    }

    if (specifier.endsWith('.js') && !existsSync(specifier)) {
      return specifier.replace(/\.js$/, '.ts');
    }
  }

  return undefined;
};
