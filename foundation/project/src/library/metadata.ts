import type { AllType, ReflectionTypes } from '@ez4/reflection';
import type { MetadataDependencies, MetadataReflection } from '../types/metadata';

import { getReflectionFiles, TypeName } from '@ez4/reflection';
import { Logger, triggerAllSync } from '@ez4/project/library';

import { assertNoErrors } from '../utils/errors';
import { DuplicateMetadataError } from '../errors/metadata';
import { buildReflection, watchReflection } from './reflection';

export type MetadataReadyListener = (metadata: MetadataReflection) => Promise<void> | void;

export type MetadataResult = {
  dependencies: MetadataDependencies;
  metadata: MetadataReflection;
};

export type BuildMetadataOptions = {
  aliasPaths?: Record<string, string[]>;
};

export const buildMetadata = (sourceFiles: string[], options?: BuildMetadataOptions): MetadataResult => {
  const reflectionTypes = buildReflection(sourceFiles, options);
  const reflectionFiles = getMetadataFiles(reflectionTypes);

  const metadata: MetadataReflection = {};

  triggerAllSync('metadata:getServices', (handler) => {
    const result = handler(reflectionTypes);

    if (result) {
      assertNoErrors(result.errors);
      assignMetadataServices(metadata, result.services);
    }

    return null;
  });

  return {
    dependencies: getReflectionFiles(reflectionFiles),
    metadata
  };
};

export type WatchMetadataOptions = {
  onMetadataReady: MetadataReadyListener;
  additionalPaths?: string[];
  aliasPaths?: Record<string, string[]>;
};

export const watchMetadata = (sourceFiles: string[], options: WatchMetadataOptions) => {
  const { additionalPaths, aliasPaths, onMetadataReady } = options;

  return watchReflection(sourceFiles, {
    additionalPaths,
    aliasPaths,
    onReflectionReady: async (reflectionTypes) => {
      const metadata: MetadataReflection = {};

      triggerAllSync('metadata:getServices', (handler) => {
        const result = handler(reflectionTypes);

        if (result) {
          if (!result.errors.length) {
            assignMetadataServices(metadata, result.services);
          }

          for (const error of result.errors) {
            Logger.error(error.message);
          }
        }

        return null;
      });

      await onMetadataReady(metadata);
    }
  });
};

const assignMetadataServices = (metadata: MetadataReflection, services: MetadataReflection) => {
  for (const identity in services) {
    if (identity in metadata) {
      throw new DuplicateMetadataError(identity);
    }

    metadata[identity] = services[identity];
  }
};

const getMetadataFiles = (reflection: ReflectionTypes) => {
  const metadataFiles = new Set<string>();

  for (const identity in reflection) {
    const declaration = reflection[identity];

    // It needs to be a file in the project's root.
    if (!declaration.file || declaration.file.startsWith('..')) {
      continue;
    }

    groupDeclarationFiles(declaration, metadataFiles);

    metadataFiles.add(declaration.file);
  }

  return [...metadataFiles];
};

const groupDeclarationFiles = (declaration: AllType, files = new Set<string>()) => {
  switch (declaration.type) {
    case TypeName.Function:
      if (declaration.file) {
        files.add(declaration.file);
      }
      break;

    case TypeName.Object:
      if (Array.isArray(declaration.members)) {
        declaration.members?.forEach((member) => {
          groupDeclarationFiles(member, files);
        });
      }
      break;

    case TypeName.Class:
    case TypeName.Interface:
      declaration.members?.forEach((member) => {
        groupDeclarationFiles(member, files);
      });
      break;
  }

  return files;
};
