import type { SemanticDiagnosticsBuilderProgram, WatchOfFilesAndCompilerOptions } from 'typescript';
import type { ResolverOptions, ResolverEvents, ReflectionFiles } from './resolver';
import type { CompilerOptions, CompilerEvents } from './compiler';
import type { ReflectionTypes } from './types';

import { createProgram, createWatchProgram } from 'typescript';
import { relative, resolve } from 'node:path';

import { getReflectionFileNames } from './utils/reflection';
import { createCompilerHost, createCompilerOptions, createWatchCompilerHost } from './compiler';
import { resolveReflectionMetadata, resolveReflectionFiles } from './resolver';

export * from './types';
export * from './compiler';
export * from './resolver';
export * from './utils';

export type ReflectionOptions = {
  /**
   * Working directory for the compiler and relative source paths.
   */
  workspacePath?: string;

  /**
   * TypeScript compiler options.
   */
  compilerOptions?: CompilerOptions;

  /**
   * All compiler events.
   */
  compilerEvents?: CompilerEvents;

  /**
   * All resolver options.
   */
  resolverOptions?: ResolverOptions;

  /**
   * All resolver events.
   */
  resolverEvents?: ResolverEvents;

  /**
   * Determines whether or not source file dependencies should be included.
   */
  includeFiles?: boolean;
};

export type ReflectionOutput = {
  dependencies: ReflectionFiles;
  reflection: ReflectionTypes;
};

export const getReflectionFromFiles = (fileNames: string[], options?: ReflectionOptions): ReflectionOutput => {
  const compilerOptions = createCompilerOptions(options?.compilerOptions);
  const compilerHost = createCompilerHost(compilerOptions, options?.compilerEvents, options?.workspacePath);

  const sourceFiles = options?.workspacePath
    ? fileNames.map((fileName) => resolve(compilerHost.getCurrentDirectory(), fileName))
    : fileNames;

  const program = createProgram({
    host: compilerHost,
    options: compilerOptions,
    rootNames: sourceFiles
  });

  const reflection = resolveReflectionMetadata(program, options);

  if (!options?.includeFiles) {
    return {
      dependencies: {},
      reflection
    };
  }

  const reflectionFiles = getReflectionFileNames(reflection, options.compilerEvents?.onReflectionFile).map((fileName) =>
    options.workspacePath ? relative(compilerHost.getCurrentDirectory(), resolve(fileName)) : fileName
  );

  const dependencies = resolveReflectionFiles(program, compilerOptions, compilerHost, reflectionFiles);

  return {
    dependencies,
    reflection
  };
};

export type WatchReflectionHandler = {
  stop: () => void;
};

export type WatchReflectionOptions = ReflectionOptions & {
  /**
   * Specify additional paths to watch.
   */
  additionalPaths?: string[];
};

export const watchReflectionFromFiles = (fileNames: string[], options?: WatchReflectionOptions) => {
  const compilerOptions = createCompilerOptions(options?.compilerOptions);

  const workspacePath = options?.workspacePath;
  const additionalPaths = options?.additionalPaths;
  const compilerEvents = options?.compilerEvents;

  const onReflectionReady = compilerEvents?.onReflectionReady;

  return new Promise<WatchReflectionHandler>((success, reject) => {
    let program: WatchOfFilesAndCompilerOptions<SemanticDiagnosticsBuilderProgram>;
    let failed = false;

    const compilerHost = createWatchCompilerHost(compilerOptions, additionalPaths, compilerEvents, workspacePath);
    const sourceFiles = workspacePath ? fileNames.map((fileName) => resolve(compilerHost.getCurrentDirectory(), fileName)) : fileNames;

    program = createWatchProgram({
      ...compilerHost,
      options: compilerOptions,
      rootFiles: sourceFiles,
      afterProgramCreate: async (event) => {
        try {
          const reflection = resolveReflectionMetadata(event.getProgram(), options);

          await onReflectionReady?.(reflection);

          success(handler);
        } catch (error) {
          if (program) {
            program.close();
          } else {
            failed = true;
          }

          reject(error);
        }
      }
    });

    if (failed) {
      program.close();
    }

    const handler = {
      stop: () => {
        program?.close();
      }
    };
  });
};

export const getReflectionFiles = (fileNames: string[], options?: CompilerOptions) => {
  const compilerOptions = createCompilerOptions(options);
  const compilerHost = createCompilerHost(compilerOptions, options);

  const program = createProgram({
    rootNames: fileNames,
    host: compilerHost,
    options: {
      ...compilerOptions,
      noCheck: true
    }
  });

  return resolveReflectionFiles(program, compilerOptions, compilerHost);
};
