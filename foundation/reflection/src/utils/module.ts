import type { CompilerHost, CompilerOptions } from 'typescript';

import type { ModuleResolutionCache } from 'typescript';

import { createModuleResolutionCache, resolveModuleName } from 'typescript';

import { getCanonicalFileName } from './compiler';

const COMPILER_CACHE = new WeakMap<CompilerHost, ModuleResolutionCache>();

const MODULES_PATH = '/node_modules/';

export const getModulePath = (moduleName: string, sourceFile: string, compilerOptions: CompilerOptions, compilerHost: CompilerHost) => {
  let resolutionCache = COMPILER_CACHE.get(compilerHost);

  if (!resolutionCache) {
    resolutionCache = createModuleResolutionCache(compilerHost.getCurrentDirectory(), (fileName) => getCanonicalFileName(fileName));
    COMPILER_CACHE.set(compilerHost, resolutionCache);
  }

  const { resolvedModule } = resolveModuleName(moduleName, sourceFile, compilerOptions, compilerHost, resolutionCache);

  return resolvedModule?.resolvedFileName;
};

export const getPathModule = (filePath: string) => {
  const moduleStart = filePath.indexOf(MODULES_PATH);

  if (moduleStart === -1) {
    return undefined;
  }

  const [moduleName, modulePath] = filePath.substring(moduleStart + MODULES_PATH.length).split('/');

  if (moduleName.startsWith('@')) {
    return `${moduleName}/${modulePath}`;
  }

  return moduleName;
};
