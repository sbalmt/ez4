import type { SourceMap } from './types';

import type {
  CompilerOptions as BaseCompilerOptions,
  SemanticDiagnosticsBuilderProgram,
  WatchCompilerHost,
  CompilerHost,
  SourceFile,
  FileWatcher
} from 'typescript';

import {
  sys,
  createSourceFile,
  getDefaultLibFilePath,
  createSemanticDiagnosticsBuilderProgram,
  ModuleResolutionKind,
  ScriptTarget,
  ModuleKind
} from 'typescript';

import { getCanonicalFileName } from './utils/compiler';

const SOURCE_CACHE = new Map<string, SourceFile>();

export type CompilerOptions = Omit<BaseCompilerOptions, 'module' | 'target' | 'strict'>;

export type ResolveFileNameListener = (fileName: string) => string;
export type ReflectionReadyListener = (reflection: SourceMap) => Promise<void> | void;

export type CompilerEvents = {
  onResolveFileName?: ResolveFileNameListener;
  onReflectionReady?: ReflectionReadyListener;
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
  const onResolveFileName = events?.onResolveFileName;

  return {
    fileExists: sys.fileExists,
    readFile: sys.readFile,
    writeFile: sys.writeFile,
    getNewLine: () => sys.newLine,
    getCurrentDirectory: sys.getCurrentDirectory,
    getDefaultLibFileName: () => getDefaultLibFilePath(options),
    useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
    getCanonicalFileName: getCanonicalFileName,
    getSourceFile: (fileName, languageVersion, onError) => {
      try {
        const resolvedFileName = onResolveFileName?.(fileName) ?? fileName;
        const cachedSourceFile = SOURCE_CACHE.get(resolvedFileName);

        if (cachedSourceFile) {
          return cachedSourceFile;
        }

        const sourceText = sys.readFile(resolvedFileName);

        if (!sourceText) {
          return undefined;
        }

        const sourceFile = createSourceFile(resolvedFileName, sourceText, languageVersion);

        SOURCE_CACHE.set(resolvedFileName, sourceFile);

        return sourceFile;
        //
      } catch (error) {
        onError?.(`${error}`);
        //
        return undefined;
      }
    }
  };
};

export const createWatchCompilerHost = (
  options: CompilerOptions,
  events?: CompilerEvents
): WatchCompilerHost<SemanticDiagnosticsBuilderProgram> => {
  const onResolveFileName = events?.onResolveFileName;

  const nullWatcher: FileWatcher = {
    close: () => {}
  };

  return {
    fileExists: sys.fileExists,
    readFile: sys.readFile,
    readDirectory: sys.readDirectory,
    getNewLine: () => sys.newLine,
    getCurrentDirectory: sys.getCurrentDirectory,
    getDefaultLibFileName: () => getDefaultLibFilePath(options),
    useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
    clearTimeout: sys.clearTimeout,
    setTimeout: sys.setTimeout,
    watchFile: (path, callback, pollingInterval, options) => {
      if (!path.includes('node_modules')) {
        return sys.watchFile!(path, callback, pollingInterval, options);
      }

      return nullWatcher;
    },
    watchDirectory: (path, callback, recursive, options) => {
      if (!path.includes('node_modules')) {
        return sys.watchDirectory!(path, callback, recursive, options);
      }

      return nullWatcher;
    },
    createProgram: (rootNames, options, host) =>
      createSemanticDiagnosticsBuilderProgram(rootNames, options, {
        ...host!,
        getSourceFile: (fileName, languageVersion, onError) => {
          try {
            const resolvedFileName = onResolveFileName?.(fileName) ?? fileName;
            return host!.getSourceFile(resolvedFileName, languageVersion, onError, false);
            //
          } catch (error) {
            onError?.(`${error}`);
            return undefined;
          }
        }
      })
  };
};
