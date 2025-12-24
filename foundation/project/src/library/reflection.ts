import type { ReflectionOptions, ReflectionReadyListener, ReflectionTypes } from '@ez4/reflection';

import { existsSync } from 'node:fs';

import { getReflectionFromFiles, watchReflectionFromFiles } from '@ez4/reflection';
import { triggerAllSync } from '@ez4/project/library';

import { ReflectionSourceFileNotFound } from '../errors/reflection';

export type BuildReflectionOptions = {
  aliasPaths?: Record<string, string[]>;
};

export const buildReflection = (sourceFiles: string[], options?: BuildReflectionOptions): ReflectionTypes => {
  assertSourceFiles(sourceFiles);

  return getReflectionFromFiles(sourceFiles, {
    ...getReflectionOptions(),
    compilerOptions: {
      paths: options?.aliasPaths
    }
  });
};

export type WatchReflectionOptions = {
  onReflectionReady: ReflectionReadyListener;
  aliasPaths?: Record<string, string[]>;
  additionalPaths?: string[];
};

export const watchReflection = (sourceFiles: string[], options: WatchReflectionOptions) => {
  assertSourceFiles(sourceFiles);

  const { additionalPaths, aliasPaths } = options;

  return watchReflectionFromFiles(sourceFiles, {
    ...getReflectionOptions(options.onReflectionReady),
    additionalPaths,
    compilerOptions: {
      paths: aliasPaths
    }
  });
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
      includeLocation: true
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
