import type { DeployOptions, EventContext, ExtraSource } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';

import { getBucketState } from '../bucket/utils.js';

export const prepareLinkedClient = async (context: EventContext, service: BucketService, options: DeployOptions): Promise<ExtraSource> => {
  const bucketState = getBucketState(context, service.name, options);
  const bucketId = bucketState.entryId;

  return {
    entryIds: [bucketId],
    constructor: `make('${bucketState.parameters.bucketName}')`,
    from: '@ez4/aws-bucket/client',
    module: 'Client'
  };
};
