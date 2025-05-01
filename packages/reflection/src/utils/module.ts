import { ModuleResolutionKind, resolveModuleName, sys } from 'typescript';

const defaultOptions = {
  moduleResolution: ModuleResolutionKind.Node16
};

const defaultHost = {
  fileExists: sys.fileExists,
  readFile: sys.readFile
};

export const getModulePath = (moduleName: string, sourceFile: string) => {
  const { resolvedModule } = resolveModuleName(moduleName, sourceFile, defaultOptions, defaultHost);

  return resolvedModule?.resolvedFileName;
};
