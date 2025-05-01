import type { CompilerOptions as BaseCompilerOptions, CompilerHost, SourceFile } from 'typescript';

import { sys, getDefaultLibFilePath, createSourceFile, ScriptTarget, ModuleKind, ModuleResolutionKind } from 'typescript';

const sourceCache = new Map<string, SourceFile>();

export type CompilerOptions = Omit<BaseCompilerOptions, 'module' | 'target' | 'strict'>;

export type CompilerEvents = {
  onResolveFileName?: (fileName: string) => string;
};

export const createCompilerOptions = (options?: CompilerOptions): BaseCompilerOptions => {
  return {
    ...options,
    moduleResolution: ModuleResolutionKind.Node16,
    module: ModuleKind.Preserve,
    target: ScriptTarget.ESNext,
    skipDefaultLibCheck: true,
    skipLibCheck: true,
    noCheck: true,
    strict: true
  };
};

export const createCompilerHost = (options: CompilerOptions, events?: CompilerEvents): CompilerHost => {
  return {
    readFile: sys.readFile,
    fileExists: sys.fileExists,
    writeFile: sys.writeFile,
    getNewLine: () => sys.newLine,
    getCurrentDirectory: sys.getCurrentDirectory,
    getDefaultLibFileName: () => getDefaultLibFilePath(options),
    useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
    getCanonicalFileName: (fileName) => {
      if (!sys.useCaseSensitiveFileNames) {
        return fileName.toLowerCase();
      }

      return fileName;
    },
    getSourceFile: (fileName, languageVersion) => {
      const resolvedFileName = events?.onResolveFileName?.(fileName) ?? fileName;
      const cacheSourceFile = sourceCache.get(resolvedFileName);

      if (cacheSourceFile) {
        return cacheSourceFile;
      }

      const sourceText = sys.readFile(resolvedFileName);

      if (!sourceText) {
        return undefined;
      }

      const sourceFile = createSourceFile(resolvedFileName, sourceText, languageVersion);

      sourceCache.set(resolvedFileName, sourceFile);

      return sourceFile;
    }
  };
};
