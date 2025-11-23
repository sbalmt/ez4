import type { MetadataReflection } from '@ez4/project/library';

import { isHttpService } from '@ez4/gateway/library';

export const getGatewayServices = (metadata: MetadataReflection) => {
  const httpServices = [];

  for (const identity in metadata) {
    const service = metadata[identity];

    if (!isHttpService(service)) {
      continue;
    }

    httpServices.push(service);
  }

  return httpServices;
};
