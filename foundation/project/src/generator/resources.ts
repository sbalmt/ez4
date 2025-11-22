import type { MetadataReflection } from '../types/metadata';
import type { CommonOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

import { NoGeneratorFoundError } from './errors';

export const generateResources = async (parameters: string[], metadata: MetadataReflection, options: CommonOptions) => {
  const hasRan = await triggerAllAsync('generator:createResource', async (handler) =>
    handler({
      parameters,
      metadata,
      options
    })
  );

  if (!hasRan) {
    throw new NoGeneratorFoundError(parameters);
  }
};
