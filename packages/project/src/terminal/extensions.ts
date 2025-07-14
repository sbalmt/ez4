import type { ResolveHook, ResolveHookContext } from 'node:module';

import { existsSync } from 'node:fs';
import { extname } from 'node:path';

export const resolve: ResolveHook = (specifier, context, defaultResolve) => {
  if (!isGlobalParentModule(context)) {
    const modulePath = resolveModulePath(specifier);

    if (modulePath && isTemporaryParentModule(context)) {
      return defaultResolve(getTemporaryModulePath(modulePath), context);
    }

    if (modulePath) {
      return defaultResolve(modulePath, context);
    }
  }

  return defaultResolve(specifier, context);
};

const isGlobalParentModule = ({ parentURL }: ResolveHookContext) => {
  return parentURL?.includes('node_modules');
};

const isTemporaryParentModule = ({ parentURL }: ResolveHookContext) => {
  return parentURL?.includes('v=');
};

const getTemporaryModulePath = (modulePath: string) => {
  return `${modulePath}?v=${Date.now().toString()}`;
};

const resolveModulePath = (specifier: string) => {
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
