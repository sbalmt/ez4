import type { DeployOptions, ExtraSource } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';

import { getServiceName } from '@ez4/project/library';
import { createBucketStateId } from '../bucket/utils.js';
import { getBucketName } from './utils.js';

export const prepareLinkedClient = async (service: BucketService, options: DeployOptions): Promise<ExtraSource> => {
  const bucketName = await getBucketName(service, options);
  const bucketId = getServiceName(service, options);
  const stateId = createBucketStateId(bucketId);

  return {
    entryId: stateId,
    constructor: `make('${bucketName}')`,
    from: '@ez4/aws-bucket/client',
    module: 'Client'
  };
};
