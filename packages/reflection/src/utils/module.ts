import {
  bundlerModuleNameResolver,
  createModuleResolutionCache,
  createCompilerHost,
  getDefaultCompilerOptions,
  ModuleResolutionKind
} from 'typescript';

import { getCanonicalFileName } from './compiler.js';

const defaultOptions = {
  ...getDefaultCompilerOptions(),
  moduleResolution: ModuleResolutionKind.Bundler
};

const compilerCache = createModuleResolutionCache(process.cwd(), getCanonicalFileName);

const compilerHost = createCompilerHost(defaultOptions);

export const getModulePath = (moduleName: string, sourceFile: string) => {
  const { resolvedModule } = bundlerModuleNameResolver(moduleName, sourceFile, defaultOptions, compilerHost, compilerCache);

  return resolvedModule?.resolvedFileName;
};
