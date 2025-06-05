import { bundlerModuleNameResolver, createCompilerHost, getDefaultCompilerOptions, ModuleResolutionKind } from 'typescript';

const defaultOptions = {
  ...getDefaultCompilerOptions(),
  moduleResolution: ModuleResolutionKind.Bundler
};

const compilerHost = createCompilerHost(defaultOptions);

export const getModulePath = (moduleName: string, sourceFile: string) => {
  const { resolvedModule } = bundlerModuleNameResolver(moduleName, sourceFile, defaultOptions, compilerHost);

  return resolvedModule?.resolvedFileName;
};
