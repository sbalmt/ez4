import type { ReflectionOptions, ReflectionOutput, ReflectionReadyListener } from '@ez4/reflection';

import { globSync } from 'node:fs';
import { resolve } from 'node:path';

import { getReflectionFromFiles, watchReflectionFromFiles } from '@ez4/reflection';
import { triggerAllSync } from '@ez4/project/library';

import { ReflectionSourceFileNotFound } from '../errors/reflection';

export type BuildReflectionOptions = {
  aliasPaths?: Record<string, string[]>;
};

export const buildReflection = (sourceFiles: string[], options?: BuildReflectionOptions): ReflectionOutput => {
  const reflectionSources = getReflectionSources(sourceFiles);
  const reflectionOptions = getReflectionOptions();

  return getReflectionFromFiles(reflectionSources, {
    ...reflectionOptions,
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
  const { additionalPaths, aliasPaths } = options;

  const reflectionSources = getReflectionSources(sourceFiles);

  const reflectionOptions = {
    ...getReflectionOptions(options.onReflectionReady),
    additionalPaths,
    compilerOptions: {
      paths: aliasPaths
    }
  };

  return watchReflectionFromFiles(reflectionSources, reflectionOptions);
};

const getReflectionOptions = (onReflectionReady?: ReflectionReadyListener): ReflectionOptions => {
  return {
    includeFiles: true,
    compilerEvents: {
      onReflectionReady,
      onResolveFileName: (fileName) => {
        return triggerAllSync('reflection:loadFile', (handler) => handler(fileName)) ?? fileName;
      },
      onReflectionFile: (type) => {
        return !!type.file && !type.file.startsWith('..');
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

export const getReflectionSources = (sourceFiles: string[]) => {
  const reflectionSources = new Set<string>();

  for (const sourceFile of sourceFiles) {
    const matches = globSync(sourceFile, {
      exclude: ['**/node_modules/**']
    });

    if (!matches.length) {
      throw new ReflectionSourceFileNotFound(sourceFile);
    }

    for (const match of matches) {
      reflectionSources.add(resolve(match));
    }
  }

  return [...reflectionSources];
};
