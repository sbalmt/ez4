import type { PrepareResourceEvent } from '@ez4/project/library';

import { isBucketService } from '@ez4/storage/library';

import { createBucket } from '../bucket/service.js';
import { prepareLocalContent } from './content.js';
import { getNewBucketName } from './utils.js';

export const prepareBucketServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isBucketService(service)) {
    return;
  }

  const { globalName, localPath, autoExpireDays, cors } = service;

  const bucketName = globalName ?? (await getNewBucketName(service, options));

  const bucketState = createBucket(state, {
    bucketName,
    autoExpireDays,
    localPath,
    cors
  });

  if (localPath) {
    await prepareLocalContent(state, bucketState, localPath);
  }
};
