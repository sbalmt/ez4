import type { ResolverOptions, ResolverEvents, ReflectionFiles } from './resolver';
import type { CompilerOptions, CompilerEvents } from './compiler';
import type { ReflectionTypes } from './types';

import { createProgram, createWatchProgram } from 'typescript';

import { createCompilerHost, createCompilerOptions, createWatchCompilerHost } from './compiler';
import { resolveReflectionMetadata, resolveReflectionFiles } from './resolver';
import { getReflectionFileNames } from './utils/reflection';

export * from './types';
export * from './compiler';
export * from './resolver';
export * from './utils';

export type ReflectionOptions = {
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
  reflection: ReflectionTypes;
  files: ReflectionFiles;
};

export const getReflectionFromFiles = (fileNames: string[], options?: ReflectionOptions): ReflectionOutput => {
  const compilerOptions = createCompilerOptions(options?.compilerOptions);
  const compilerHost = createCompilerHost(compilerOptions, options?.compilerEvents);

  const program = createProgram({
    host: compilerHost,
    options: compilerOptions,
    rootNames: fileNames
  });

  const reflection = resolveReflectionMetadata(program, options);

  return {
    reflection,
    files: options?.includeFiles
      ? resolveReflectionFiles(
          program,
          compilerOptions,
          compilerHost,
          getReflectionFileNames(reflection, options.compilerEvents?.onReflectionFile)
        )
      : {}
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

  const additionalPaths = options?.additionalPaths;
  const compilerEvents = options?.compilerEvents;

  const onReflectionReady = compilerEvents?.onReflectionReady;

  return new Promise<WatchReflectionHandler>((resolve, reject) => {
    const program = createWatchProgram({
      ...createWatchCompilerHost(compilerOptions, additionalPaths, compilerEvents),
      options: compilerOptions,
      rootFiles: fileNames,
      afterProgramCreate: async (event) => {
        try {
          const reflection = resolveReflectionMetadata(event.getProgram(), options);

          await onReflectionReady?.(reflection);

          resolve(handler);
        } catch (error) {
          program.close();
          reject(error);
        }
      }
    });

    const handler = {
      stop: () => {
        program.close();
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
      skipLibCheck: true,
      noCheck: true
    }
  });

  return resolveReflectionFiles(program, compilerOptions, compilerHost);
};
