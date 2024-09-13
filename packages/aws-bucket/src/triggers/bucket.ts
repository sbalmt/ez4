import type { ServiceResourceEvent } from '@ez4/project/library';

import { isBucketService } from '@ez4/storage/library';

import { createBucket } from '../bucket/service.js';
import { getBucketName } from './utils.js';

export const prepareBucketServices = async (event: ServiceResourceEvent) => {
  const { state, service, options } = event;

  if (!isBucketService(service)) {
    return;
  }

  createBucket(state, {
    bucketName: getBucketName(service, options)
  });
};
