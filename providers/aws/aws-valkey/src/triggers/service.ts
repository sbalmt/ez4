import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { createCache } from '../cache/service';
import { getCacheName, isValkeyService } from './utils';
import { prepareLinkedClient } from './client';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isValkeyService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareServices = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isValkeyService(service)) {
    return false;
  }

  const { description } = service;

  const cacheState = createCache(state, {
    name: getCacheName(service, options),
    tags: options.tags,
    description
  });

  context.setServiceState(service, options, cacheState);

  return true;
};
