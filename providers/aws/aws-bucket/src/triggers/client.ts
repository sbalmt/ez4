import type { DeployOptions, EventContext, ContextSource } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';

import { getBucketState } from '../bucket/utils';

export const prepareLinkedClient = (context: EventContext, service: BucketService, options: DeployOptions): ContextSource => {
  const bucketState = getBucketState(context, service.name, options);
  const bucketId = bucketState.entryId;

  return {
    module: 'Client',
    from: '@ez4/aws-bucket/client',
    constructor: `@{EZ4_MODULE_IMPORT}.make('${bucketState.parameters.bucketName}')`,
    dependencyIds: [bucketId],
    connectionIds: [bucketId]
  };
};
