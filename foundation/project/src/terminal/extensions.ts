import type { ResolveHook, ResolveHookContext } from 'node:module';

import { fileURLToPath } from 'node:url';
import { dirname, extname, join } from 'node:path';
import { existsSync } from 'node:fs';

export const resolve: ResolveHook = (specifier, context, defaultResolve) => {
  if (isGlobalParentModule(context)) {
    return defaultResolve(specifier, context);
  }

  const parentFile = context.parentURL && fileURLToPath(context.parentURL);
  const modulePath = resolveModulePath(specifier, parentFile);

  if (!modulePath) {
    return defaultResolve(specifier, context);
  }

  if (isTemporaryParentModule(context)) {
    return defaultResolve(getTemporaryModulePath(modulePath), context);
  }

  return defaultResolve(modulePath, context);
};

const isGlobalParentModule = ({ parentURL }: ResolveHookContext) => {
  return parentURL?.includes('/node_modules/');
};

const isTemporaryParentModule = ({ parentURL }: ResolveHookContext) => {
  return parentURL?.includes('v=');
};

const getTemporaryModulePath = (modulePath: string) => {
  return `${modulePath}?v=${Date.now()}`;
};

const resolveModulePath = (specifier: string, parentFile: string | undefined) => {
  if (specifier.startsWith('file://')) {
    return undefined;
  }

  const parentPath = parentFile ? dirname(parentFile) : '.';

  if (specifier.startsWith('.') && !extname(specifier)) {
    return resolveSpecifier(specifier, parentPath, 'js') ?? resolveSpecifier(specifier, parentPath, 'ts');
  }

  if (specifier.endsWith('.js')) {
    return resolveSpecifier(specifier.slice(0, -3), parentPath, 'ts');
  }

  return undefined;
};

const resolveSpecifier = (specifier: string, parentPath: string, extension: string) => {
  const filePath = `${specifier}.${extension}`;

  if (existsSync(join(parentPath, filePath))) {
    return filePath;
  }

  return undefined;
};
