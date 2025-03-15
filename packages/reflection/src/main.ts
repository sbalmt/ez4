import type { CompilerOptions, CompilerEvents } from './compiler.js';
import type { ResolverOptions, ResolverEvents } from './resolver.js';

import { relative } from 'node:path';

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

export const reflectionFiles = (fileNames: string[], options?: Options) => {
  const compilerOptions = createCompilerOptions(options?.compilerOptions);

  const program = createProgram({
    rootNames: fileNames,
    options: {
      ...compilerOptions,
      skipLibCheck: true,
      noCheck: true
    },
    host: createCompilerHost(compilerOptions, options?.compilerEvents)
  });

  const basePath = process.cwd();
  const pathList = [];

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) {
      continue;
    }

    const filePath = relative(basePath, sourceFile.fileName);

    pathList.push(filePath);
  }

  return pathList;
};
