import {
  ModuleResolutionKind,
  getDefaultCompilerOptions,
  createModuleResolutionCache,
  createCompilerHost,
  resolveModuleName
} from 'typescript';

import { getCanonicalFileName } from './compiler.js';

const DEFAULT_OPTIONS = {
  ...getDefaultCompilerOptions(),
  moduleResolution: ModuleResolutionKind.Bundler,
  preserveSymlinks: true
};

const COMPILER_HOST = createCompilerHost(DEFAULT_OPTIONS);

const COMPILER_CACHE = createModuleResolutionCache(process.cwd(), getCanonicalFileName);

const MODULES_PATH = '/node_modules/';

export const getModulePath = (moduleName: string, sourceFile: string) => {
  const { resolvedModule } = resolveModuleName(moduleName, sourceFile, DEFAULT_OPTIONS, COMPILER_HOST, COMPILER_CACHE);

  return resolvedModule?.resolvedFileName;
};

export const getPathModule = (filePath: string): string | null => {
  const moduleStart = filePath.indexOf(MODULES_PATH);

  if (moduleStart === -1) {
    return null;
  }

  const [moduleName, modulePath] = filePath.substring(moduleStart + MODULES_PATH.length).split('/');

  if (moduleName.startsWith('@')) {
    return `${moduleName}/${modulePath}`;
  }

  return moduleName;
};
