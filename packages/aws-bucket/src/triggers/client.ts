import type { ExtraSource } from '@ez4/project/library';

import { createBucketStateId } from '../bucket/utils.js';

export const prepareLinkedClient = (bucketId: string, bucketName: string): ExtraSource => {
  const bucketStateId = createBucketStateId(bucketId);

  return {
    entryId: bucketStateId,
    constructor: `make('${bucketName}')`,
    from: '@ez4/aws-bucket/client',
    module: 'Client'
  };
};
