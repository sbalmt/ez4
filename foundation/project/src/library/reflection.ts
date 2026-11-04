import type { ReflectionOptions, ReflectionOutput, ReflectionReadyListener } from '@ez4/reflection';

import { globSync } from 'node:fs';

import { getReflectionFromFiles, watchReflectionFromFiles } from '@ez4/reflection';
import { triggerAllSync } from '@ez4/project/library';

import { ReflectionSourceFileNotFound } from '../errors/reflection';

export type BuildReflectionOptions = {
  aliasPaths?: Record<string, string[]>;
  workspacePath?: string;
};

export const buildReflection = (sourceFiles: string[], options?: BuildReflectionOptions): ReflectionOutput => {
  const reflectionSources = getReflectionSources(sourceFiles, options?.workspacePath);
  const reflectionOptions = getReflectionOptions();

  return getReflectionFromFiles(reflectionSources, {
    ...reflectionOptions,
    workspacePath: options?.workspacePath,
    compilerOptions: {
      paths: options?.aliasPaths
    }
  });
};

export type WatchReflectionOptions = {
  onReflectionReady: ReflectionReadyListener;
  aliasPaths?: Record<string, string[]>;
  additionalPaths?: string[];
  workspacePath?: string;
};

export const watchReflection = (sourceFiles: string[], options: WatchReflectionOptions) => {
  const { additionalPaths, aliasPaths, workspacePath } = options;

  const reflectionSources = getReflectionSources(sourceFiles, workspacePath);

  return watchReflectionFromFiles(reflectionSources, {
    ...getReflectionOptions(options.onReflectionReady),
    workspacePath,
    additionalPaths,
    compilerOptions: {
      paths: aliasPaths
    }
  });
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

export const getReflectionSources = (sourceFiles: string[], workspacePath?: string) => {
  const reflectionSources = new Set<string>();

  for (const sourceFile of sourceFiles) {
    const matches = globSync(sourceFile, {
      cwd: workspacePath ?? process.cwd(),
      exclude: ['**/node_modules/**']
    });

    if (!matches.length) {
      throw new ReflectionSourceFileNotFound(sourceFile);
    }

    for (const match of matches) {
      reflectionSources.add(match);
    }
  }

  return [...reflectionSources];
};
