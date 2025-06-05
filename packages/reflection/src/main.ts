import type { CompilerOptions, CompilerEvents } from './compiler.js';
import type { ResolverOptions, ResolverEvents } from './resolver.js';

import { createProgram } from 'typescript';

import { createCompilerHost, createCompilerOptions } from './compiler.js';
import { getReflectionMetadata, getReflectionFiles } from './resolver.js';

export * from './types.js';
export * from './compiler.js';
export * from './resolver.js';
export * from './utils.js';

export type Options = {
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

export const reflectionFromFiles = (fileNames: string[], options?: Options) => {
  const compilerOptions = createCompilerOptions(options?.compilerOptions);

  const program = createProgram({
    host: createCompilerHost(compilerOptions, options?.compilerEvents),
    options: compilerOptions,
    rootNames: fileNames
  });

  return getReflectionMetadata(program, options);
};

export const reflectionFiles = (fileNames: string[], options?: CompilerOptions) => {
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

  return getReflectionFiles(program);
};
