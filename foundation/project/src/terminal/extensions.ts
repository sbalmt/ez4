import type { ResolveHook, ResolveHookContext } from 'node:module';

import { fileURLToPath } from 'node:url';
import { dirname, extname, join } from 'node:path';
import { existsSync } from 'node:fs';

import { tryLoadProject } from '../config/project';
import { loadPaths } from '../config/tsconfig';

const options = await tryLoadProject(process.env.EZ4_PROJECT_FILE);
const paths = options ? await loadPaths(options) : {};

export const resolve: ResolveHook = (specifier, context, defaultResolve) => {
  if (isGlobalParentModule(context)) {
    return defaultResolve(specifier, context);
  }

  const parentFile = context.parentURL ? fileURLToPath(context.parentURL) : '.';
  const modulePath = resolveImportPath(specifier, parentFile, paths);

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

const resolveImportPath = (specifier: string, parentFile: string, paths: Record<string, string[]>) => {
  for (const prefix in paths) {
    const prefixPattern = prefix.substring(0, prefix.length - 1);

    if (!specifier.startsWith(prefixPattern)) {
      continue;
    }

    for (const globPath of paths[prefix]) {
      const mergedPath = globPath.substring(0, globPath.length - 1) + specifier.substring(prefix.length - 1);
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
