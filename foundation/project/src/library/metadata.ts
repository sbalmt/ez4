import type { MetadataDependencies, MetadataReflection } from '../types/metadata';

import { triggerAllSync } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

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
  const { dependencies, reflection } = buildReflection(sourceFiles, options);

  const metadata: MetadataReflection = {};

  triggerAllSync('metadata:getServices', (handler) => {
    const result = handler(reflection);

    if (result) {
      assertNoErrors(result.errors);
      assignMetadataServices(metadata, result.services);
    }

    return null;
  });

  return {
    metadata,
    dependencies
  };
};

export type WatchMetadataOptions = {
  onMetadataReady: MetadataReadyListener;
  aliasPaths?: Record<string, string[]>;
  additionalPaths?: string[];
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
