import type { CompilerOptions as BaseCompilerOptions, CompilerHost, SourceFile } from 'typescript';

import { sys, getDefaultLibFilePath, createSourceFile, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';

import { getCanonicalFileName } from './utils/compiler.js';

const sourceCache = new Map<string, SourceFile>();

export type CompilerOptions = Omit<BaseCompilerOptions, 'module' | 'target' | 'strict'>;

export type CompilerEvents = {
  onResolveFileName?: (fileName: string) => string;
};

export const createCompilerOptions = (options?: CompilerOptions): BaseCompilerOptions => {
  return {
    ...options,
    module: ModuleKind.Preserve,
    moduleResolution: ModuleResolutionKind.Bundler,
    target: ScriptTarget.ESNext,
    skipDefaultLibCheck: true,
    checkJs: false,
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
    getCanonicalFileName: getCanonicalFileName,
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
