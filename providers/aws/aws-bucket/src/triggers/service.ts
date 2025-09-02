import type { ServiceEvent, ConnectResourceEvent, PrepareResourceEvent } from '@ez4/project/library';

import { isBucketService } from '@ez4/storage/library';

import { createBucket } from '../bucket/service';
import { connectEvents, prepareEvents } from './events';
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

  const { localPath, autoExpireDays, events, cors } = service;

  const bucketName = await getBucketName(service, options);

  const functionState = prepareEvents(state, service, options, context);

  const bucketState = createBucket(state, functionState, {
    eventsPath: events?.path,
    tags: options.tags,
    bucketName,
    autoExpireDays,
    localPath,
    cors
  });

  context.setServiceState(bucketState, service, options);

  if (localPath) {
    await prepareLocalContent(state, bucketState, localPath);
  }

  return true;
};

export const connectBucketServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isBucketService(service)) {
    connectEvents(state, service, options, context);
  }
};
