import type { CompilerOptions, CompilerEvents } from './compiler.js';
import type { ResolverOptions, ResolverEvents } from './resolver.js';

import { createProgram, createWatchProgram } from 'typescript';

import { createCompilerHost, createCompilerOptions, createWatchCompilerHost } from './compiler.js';
import { resolveReflectionMetadata, resolveReflectionFiles } from './resolver.js';

export * from './types.js';
export * from './compiler.js';
export * from './resolver.js';
export * from './utils.js';

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

export const watchReflectionFromFiles = (fileNames: string[], options?: ReflectionOptions) => {
  const compilerOptions = createCompilerOptions(options?.compilerOptions);
  const onReflectionReady = options?.compilerEvents?.onReflectionReady;

  return new Promise((resolve) => {
    const program = createWatchProgram({
      ...createWatchCompilerHost(compilerOptions, options?.compilerEvents),
      options: compilerOptions,
      rootFiles: fileNames,
      afterProgramCreate: async (event) => {
        const reflection = resolveReflectionMetadata(event.getProgram(), options);

        await onReflectionReady?.(reflection);

        resolve(handler);
      }
    });

    const handler: WatchReflectionHandler = {
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
