import type { ResolveHook, ResolveHookContext } from 'node:module';

import { fileURLToPath } from 'node:url';
import { dirname, extname, join } from 'node:path';
import { existsSync } from 'node:fs';

import { loadAliasPaths } from '../config/tsconfig';
import { loadProject } from '../common/project';

const options = await loadProject(process.env.EZ4_PROJECT_FILE);
const aliases = await loadAliasPaths(options);

export const resolve: ResolveHook = (specifier, context, defaultResolve) => {
  if (isGlobalParentModule(context)) {
    return defaultResolve(specifier, context);
  }

  const parentFile = context.parentURL ? fileURLToPath(context.parentURL) : '.';
  const modulePath = resolveImportPath(specifier, parentFile, aliases);

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

const resolveImportPath = (specifier: string, parentFile: string, aliasPaths: Record<string, string[]>) => {
  for (const alias in aliasPaths) {
    const aliasPattern = alias.substring(0, alias.length - 1);

    if (!specifier.startsWith(aliasPattern)) {
      continue;
    }

    for (const path of aliasPaths[alias]) {
      const mergedPath = path.substring(0, path.length - 1) + specifier.substring(alias.length - 1);
      const modulePath = resolveModulePath(mergedPath, process.cwd());

      if (modulePath) {
        return modulePath;
      }
    }
  }

  return resolveModulePath(specifier, dirname(parentFile));
};

const resolveModulePath = (specifier: string, parentPath: string) => {
  if (specifier.startsWith('file://')) {
    return undefined;
  }

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
  const fullPath = join(parentPath, filePath);

  if (existsSync(fullPath)) {
    return fullPath;
  }

  return undefined;
};
