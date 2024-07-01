import type { CompilerOptions, CompilerEvents } from './compiler.js';
import type { ResolverOptions, ResolverEvents } from './resolver.js';

import { createProgram } from 'typescript';
import { createCompilerHost, createCompilerOptions } from './compiler.js';
import { createReflection } from './resolver.js';

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
    rootNames: fileNames,
    options: compilerOptions,
    host: createCompilerHost(compilerOptions, options?.compilerEvents)
  });

  return createReflection(program, options);
};
