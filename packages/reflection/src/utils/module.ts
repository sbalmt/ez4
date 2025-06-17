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
