import type { ContextSource, DeployOptions, EmulateClientEvent, EventContext } from '@ez4/project/library';
import type { CacheService } from '@ez4/cache/library';
import type { CacheState } from '../cache/types';

import { getDefinitionName } from '@ez4/project/library';

import { getCacheState } from '../cache/utils';
import { getConnectionOptions } from '../local/options';
import { CacheNotFoundError } from '../cache/errors';
import { importCache } from '../cache/client';
import { Client } from '../client';
import { getCacheName, isValkeyService } from './utils';

export const prepareLinkedClient = (context: EventContext, service: CacheService, options: DeployOptions): ContextSource => {
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

export const prepareEmulatorClient = async (event: EmulateClientEvent) => {
  const { service, options } = event;

  if (!isValkeyService(service)) {
    return null;
  }

  if (options.local) {
    const connection = getConnectionOptions(service, options);

    return Client.make({
      identifier: service.name,
      debug: options.debug,
      connection: {
        endpoint: connection.endpoint,
        port: connection.port,
        tls: false
      }
    });
  }

  const cache = await importCache(undefined, getCacheName(service, options));

  if (!cache) {
    throw new CacheNotFoundError(service.name);
  }

  return Client.make({
    identifier: service.name,
    debug: options.debug,
    connection: {
      endpoint: cache.writerEndpoint
    }
  });
};
