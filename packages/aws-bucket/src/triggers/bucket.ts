import type { PrepareResourceEvent } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isBucketService } from '@ez4/storage/library';

import { createBucket } from '../bucket/service.js';
import { prepareLocalContent } from './content.js';

export const prepareBucketServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isBucketService(service)) {
    return;
  }

  const { autoExpireDays, localPath } = service;

  const bucketState = createBucket(state, {
    bucketName: getServiceName(service, options),
    autoExpireDays,
    localPath
  });

  if (localPath) {
    await prepareLocalContent(state, bucketState, localPath);
  }
};
