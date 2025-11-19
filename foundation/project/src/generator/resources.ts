import type { MetadataReflection } from '../types/metadata';
import type { CommonOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

export const generateResources = async (parameters: string[], metadata: MetadataReflection, options: CommonOptions) => {
  await triggerAllAsync('generator:createResource', async (handler) => {
    await handler({
      parameters,
      metadata,
      options
    });
  });
};
