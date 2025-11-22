import type { MetadataReflection } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';

export const getDatabaseServices = (metadata: MetadataReflection) => {
  const databaseServices = [];

  for (const identity in metadata) {
    const service = metadata[identity];

    if (!isDatabaseService(service)) {
      continue;
    }

    databaseServices.push(service);
  }

  return databaseServices;
};
