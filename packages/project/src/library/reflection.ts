import type { SourceMap, TypeObject } from '@ez4/reflection';

import { resolveReflectionMetadata, createCompilerHost, createCompilerOptions } from '@ez4/reflection';
import { triggerAllSync } from '@ez4/project/library';
import { createProgram } from 'typescript';
import { existsSync } from 'node:fs';

import { ReflectionSourceFileNotFound } from '../errors/reflection.js';

export const getReflection = (sourceFiles: string[]): SourceMap => {
  assertSourceFiles(sourceFiles);

  const options = createCompilerOptions();

  const program = createProgram({
    options,
    rootNames: sourceFiles,
    host: createCompilerHost(options, {
      onResolveFileName: (fileName: string) => {
        return triggerAllSync('reflection:loadFile', (handler) => handler(fileName)) ?? fileName;
      }
    })
  });

  return resolveReflectionMetadata(program, {
    resolverOptions: {
      includePath: true,
      ignoreMethod: true
    },
    resolverEvents: {
      onTypeObject: (type: TypeObject) => {
        return triggerAllSync('reflection:typeObject', (handler) => handler(type)) ?? type;
      }
    }
  });
};

const assertSourceFiles = (sourceFiles: string[]) => {
  for (const sourceFile of sourceFiles) {
    if (!existsSync(sourceFile)) {
      throw new ReflectionSourceFileNotFound(sourceFile);
    }
  }
};
