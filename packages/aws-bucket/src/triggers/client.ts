import type { ExtraSource } from '@ez4/project/library';

import { getBucketStateId } from '../bucket/utils.js';

export const prepareLinkedClient = (bucketName: string): ExtraSource => {
  const bucketEntryId = getBucketStateId(bucketName);

  return {
    entryId: bucketEntryId,
    constructor: `make('${bucketName}')`,
    from: '@ez4/aws-bucket/client',
    module: 'Client'
  };
};
