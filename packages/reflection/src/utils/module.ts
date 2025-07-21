import {
  ModuleResolutionKind,
  getDefaultCompilerOptions,
  createModuleResolutionCache,
  createCompilerHost,
  resolveModuleName
} from 'typescript';

import { getCanonicalFileName } from './compiler.js';

const defaultOptions = {
  ...getDefaultCompilerOptions(),
  moduleResolution: ModuleResolutionKind.Bundler,
  preserveSymlinks: true
};

const compilerCache = createModuleResolutionCache(process.cwd(), getCanonicalFileName);

const compilerHost = createCompilerHost(defaultOptions);

export const getModulePath = (moduleName: string, sourceFile: string) => {
  const { resolvedModule } = resolveModuleName(moduleName, sourceFile, defaultOptions, compilerHost, compilerCache);

  return resolvedModule?.resolvedFileName;
};

export const getPathModule = (filePath: string): string | null => {
  const moduleStart = filePath.indexOf('/node_modules/');

  if (moduleStart === -1) {
    return null;
  }

  const [moduleName, modulePath] = filePath.substring(moduleStart).split('/');

  if (moduleName.startsWith('@')) {
    return `${moduleName}/${modulePath}`;
  }

  return moduleName;
};
