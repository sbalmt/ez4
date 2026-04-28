import type { ServiceEvent, ConnectResourceEvent, PrepareResourceEvent } from '@ez4/project/library';

import { isBucketService } from '@ez4/storage/library';

import { createBucket } from '../bucket/service';
import { connectEvents, prepareBucketEvents } from './events';
import { prepareLocalContent } from './content';
import { prepareLinkedClient } from './client';
import { getBucketName } from './utils';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isBucketService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareBucketServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isBucketService(service)) {
    return false;
  }

  const { localPath, autoExpireDays, cors } = service;

  const bucketName = await getBucketName(service, options);

  const bucketState = createBucket(state, {
    tags: options.tags,
    bucketName,
    autoExpireDays,
    localPath,
    cors
  });

  context.setServiceState(service, options, bucketState);

  if (localPath) {
    await prepareLocalContent(state, bucketState, localPath);
  }

  prepareBucketEvents(state, service, bucketState, options, context);

  return true;
};

export const connectBucketServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isBucketService(service)) {
    connectEvents(state, service, options, context);
  }
};
