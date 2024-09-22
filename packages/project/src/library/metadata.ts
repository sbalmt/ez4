import { triggerAllSync } from '@ez4/project/library';

import { DuplicateMetadataError } from '../errors/metadata.js';
import { MetadataReflection, MetadataResult } from '../types/metadata.js';
import { assertNoErrors } from '../utils/errors.js';
import { getReflection } from './reflection.js';

export const getMetadata = (sourceFiles: string[]) => {
  const reflection = getReflection(sourceFiles);
  const metadata: MetadataReflection = {};

  triggerAllSync('metadata:getServices', (handler) => {
    const result = handler(reflection);

    if (result) {
      assertNoErrors(result.errors);
      assignMetadataResult(metadata, result);
    }

    return null;
  });

  return metadata;
};

const assignMetadataResult = (reflection: MetadataReflection, result: MetadataResult) => {
  for (const identity in result.services) {
    if (identity in reflection) {
      throw new DuplicateMetadataError(identity);
    }

    reflection[identity] = result.services[identity];
  }
};
