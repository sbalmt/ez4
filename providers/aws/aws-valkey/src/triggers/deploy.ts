import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { CacheState } from '../cache/types';

import { getDefinitionName } from '@ez4/project/library';

import { createCache } from '../cache/service';
import { getCacheState } from '../cache/utils';
import { getCacheName, isValkeyService } from './utils';

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

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (!isValkeyService(service)) {
    return null;
  }

  const cacheState = getCacheState(context, service.name, options);
  const cacheName = getCacheName(service, options);
  const cacheId = cacheState.entryId;

  const endpoint = getDefinitionName<CacheState>(cacheId, 'writerEndpoint');

  return {
    module: 'Client',
    from: '@ez4/aws-valkey/client',
    constructor:
      `@{EZ4_MODULE_IMPORT}.make({ ` +
      `identifier: "${cacheName}", ` +
      `connection: { endpoint: ${endpoint} }, ` +
      `debug: ${options.debug ?? false} ` +
      `})`,
    connectionIds: [cacheId],
    dependencyIds: [cacheId],
    requireVpc: true
  };
};
