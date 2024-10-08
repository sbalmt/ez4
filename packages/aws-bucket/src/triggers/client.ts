import type { ExtraSource, ServiceEvent } from '@ez4/project/library';

import { isBucketService } from '@ez4/storage/library';
import { getServiceName } from '@ez4/project/library';

export const prepareLinkedService = async (event: ServiceEvent): Promise<ExtraSource | null> => {
  const { service, options } = event;

  if (!isBucketService(service)) {
    return null;
  }

  const bucketName = getServiceName(service, options);

  return {
    constructor: `make('${bucketName}')`,
    module: 'Client',
    from: '@ez4/aws-bucket/client'
  };
};
