import type { ResolveHookContext } from 'node:module';

import { registerHooks } from 'node:module';
import { dirname, extname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

import { tryLoadReferences } from '../config/references';
import { tryLoadProject } from '../config/project';

const project = await tryLoadProject(process.env.EZ4_PROJECT_FILE, undefined, true);
const references = await tryLoadReferences(project);
const aliasPaths = references.main?.paths ?? {};

registerHooks({
  resolve: (specifier, context, defaultResolve) => {
    if (isGlobalParentModule(context)) {
      return defaultResolve(specifier, context);
    }

    const parentFile = context.parentURL ? fileURLToPath(context.parentURL) : '.';
    const modulePath = resolveImportPath(specifier, parentFile, aliasPaths);

    if (!modulePath) {
      return defaultResolve(specifier, context);
    }

    return defaultResolve(modulePath, context);
  }
});

const isGlobalParentModule = ({ parentURL }: ResolveHookContext) => {
  return parentURL?.includes('/node_modules/');
};

const resolveImportPath = (specifier: string, parentFile: string, aliasPaths: Record<string, string[]>) => {
  for (const prefix in aliasPaths) {
    const prefixPattern = prefix.substring(0, prefix.length - 1);

    if (!specifier.startsWith(prefixPattern)) {
      continue;
    }

    for (const globPath of aliasPaths[prefix]) {
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

  if ((specifier.startsWith('.') || isAbsolute(specifier)) && !extname(specifier)) {
    return resolveSpecifier(specifier, parentPath, 'js') ?? resolveSpecifier(specifier, parentPath, 'ts');
  }

  if (specifier.endsWith('.js')) {
    return resolveSpecifier(specifier.slice(0, -3), parentPath, 'ts');
  }

  return undefined;
};

const resolveSpecifier = (specifier: string, parentPath: string, extension: string) => {
  const filePath = `${specifier}.${extension}`;
  const fullPath = resolve(parentPath, filePath);

  if (existsSync(fullPath)) {
    return fullPath;
  }

  return undefined;
};
