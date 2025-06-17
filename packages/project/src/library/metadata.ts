import type { AllType, SourceMap } from '@ez4/reflection';
import type { MetadataReflection } from '../types/metadata.js';

import { getReflectionFiles, TypeName } from '@ez4/reflection';
import { triggerAllSync } from '@ez4/project/library';

import { DuplicateMetadataError } from '../errors/metadata.js';
import { assertNoErrors } from '../utils/errors.js';
import { getReflection } from './reflection.js';

export const getMetadata = (sourceFiles: string[]) => {
  const reflectionTypes = getReflection(sourceFiles);
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

const assignMetadataServices = (metadata: MetadataReflection, services: MetadataReflection) => {
  for (const identity in services) {
    if (identity in metadata) {
      throw new DuplicateMetadataError(identity);
    }

    metadata[identity] = services[identity];
  }
};

const getMetadataFiles = (reflection: SourceMap) => {
  const metadataFiles = new Set<string>();

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!declaration.file || declaration.file.startsWith('..')) {
      continue;
    }

    groupDeclarationFiles(declaration, metadataFiles);
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
        declaration.members?.forEach((member) => groupDeclarationFiles(member, files));
      }
      break;

    case TypeName.Class:
    case TypeName.Interface:
      declaration.members?.forEach((member) => groupDeclarationFiles(member, files));
      break;
  }

  return files;
};
