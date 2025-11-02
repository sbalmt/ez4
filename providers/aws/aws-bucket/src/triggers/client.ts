import type { DeployOptions, EventContext, ContextSource } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';

import { getBucketState } from '../bucket/utils';

export const prepareLinkedClient = (context: EventContext, service: BucketService, options: DeployOptions): ContextSource => {
  const bucketState = getBucketState(context, service.name, options);
  const bucketId = bucketState.entryId;

  return {
    entryIds: [bucketId],
    constructor: `make('${bucketState.parameters.bucketName}')`,
    from: '@ez4/aws-bucket/client',
    module: 'Client'
  };
};
