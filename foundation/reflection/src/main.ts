import type { CompilerOptions, CompilerEvents } from './compiler';
import type { ResolverOptions, ResolverEvents } from './resolver';

import { createProgram, createWatchProgram } from 'typescript';

import { createCompilerHost, createCompilerOptions, createWatchCompilerHost } from './compiler';
import { resolveReflectionMetadata, resolveReflectionFiles } from './resolver';

export * from './types';
export * from './compiler';
export * from './resolver';
export * from './utils';

export type ReflectionOptions = {
  /**
   * All resolver options.
   */
  resolverOptions?: ResolverOptions;

  /**
   * TypeScript compiler options.
   */
  compilerOptions?: CompilerOptions;

  /**
   * All resolver events.
   */
  resolverEvents?: ResolverEvents;

  /**
   * All compiler events.
   */
  compilerEvents?: CompilerEvents;
};

export const getReflectionFromFiles = (fileNames: string[], options?: ReflectionOptions) => {
  const compilerOptions = createCompilerOptions(options?.compilerOptions);

  const program = createProgram({
    host: createCompilerHost(compilerOptions, options?.compilerEvents),
    options: compilerOptions,
    rootNames: fileNames
  });

  return resolveReflectionMetadata(program, options);
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
        const reflection = resolveReflectionMetadata(event.getProgram(), options);

        try {
          await onReflectionReady?.(reflection);
        } catch (error) {
          reject(error);
        }

        resolve(handler);
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

  const program = createProgram({
    host: createCompilerHost(compilerOptions, options),
    rootNames: fileNames,
    options: {
      ...compilerOptions,
      skipLibCheck: true,
      noCheck: true
    }
  });

  return resolveReflectionFiles(program);
};
