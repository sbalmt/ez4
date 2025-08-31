import type { ReflectionOptions, ReflectionReadyListener, SourceMap } from '@ez4/reflection';

import { existsSync } from 'node:fs';

import { getReflectionFromFiles, watchReflectionFromFiles } from '@ez4/reflection';
import { triggerAllSync } from '@ez4/project/library';

import { ReflectionSourceFileNotFound } from '../errors/reflection.js';

export const getReflection = (sourceFiles: string[]): SourceMap => {
  assertSourceFiles(sourceFiles);

  return getReflectionFromFiles(sourceFiles, getReflectionOptions());
};

export const watchReflection = (sourceFiles: string[], onReflectionReady: ReflectionReadyListener) => {
  assertSourceFiles(sourceFiles);

  return watchReflectionFromFiles(sourceFiles, getReflectionOptions(onReflectionReady));
};

const getReflectionOptions = (onReflectionReady?: ReflectionReadyListener): ReflectionOptions => {
  return {
    compilerEvents: {
      onReflectionReady,
      onResolveFileName: (fileName) => {
        return triggerAllSync('reflection:loadFile', (handler) => handler(fileName)) ?? fileName;
      }
    },
    resolverEvents: {
      onTypeObject: (type) => {
        return triggerAllSync('reflection:typeObject', (handler) => handler(type)) ?? type;
      }
    },
    resolverOptions: {
      ignoreMethod: true,
      includePath: true
    }
  };
};

const assertSourceFiles = (sourceFiles: string[]) => {
  for (const sourceFile of sourceFiles) {
    if (!existsSync(sourceFile)) {
      throw new ReflectionSourceFileNotFound(sourceFile);
    }
  }
};
