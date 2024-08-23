import { triggerAllSync } from '@ez4/project/library';

import { DuplicateMetadataError } from '../errors/metadata.js';
import { MetadataReflection } from '../types/metadata.js';
import { assertNoErrors } from '../utils/errors.js';
import { getReflection } from './reflection.js';

export const getMetadata = (sourceFiles: string[]) => {
  const reflection = getReflection(sourceFiles);

  const metadata: MetadataReflection = {};

  triggerAllSync('metadata:getServices', (handler) => {
    const result = handler(reflection);

    if (result) {
      assertNoErrors(result.errors);

      for (const identity in result.services) {
        if (identity in metadata) {
          throw new DuplicateMetadataError(identity);
        }

        metadata[identity] = result.services[identity];
      }
    }

    return null;
  });

  return metadata;
};
