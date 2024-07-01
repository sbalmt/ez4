import type { CompilerOptions as BaseCompilerOptions, CompilerHost } from 'typescript';

import { sys, getDefaultLibFilePath, createSourceFile, ScriptTarget, ModuleKind } from 'typescript';

export type CompilerOptions = Omit<BaseCompilerOptions, 'module' | 'target' | 'strict'>;

export type CompilerEvents = {
  onResolveFileName?: (fileName: string) => string;
};

export const createCompilerOptions = (options?: CompilerOptions): BaseCompilerOptions => {
  return {
    ...options,
    module: ModuleKind.Preserve,
    target: ScriptTarget.ESNext,
    strict: true
  };
};

export const createCompilerHost = (
  options: CompilerOptions,
  events?: CompilerEvents
): CompilerHost => {
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
      const sourceText = sys.readFile(resolvedFileName);

      if (sourceText) {
        return createSourceFile(resolvedFileName, sourceText, languageVersion);
      }

      return undefined;
    }
  };
};
