import type { ContextSource, DeployOptions, EmulateClientEvent, EventContext } from '@ez4/project/library';
import type { CacheService } from '@ez4/cache/library';
import type { CacheState } from '../cache/types';

import { getDefinitionName } from '@ez4/project/library';

import { getConnectionOptions } from '../local/options';
import { CacheNotFoundError } from '../cache/errors';
import { getCacheState } from '../cache/utils';
import { importCache } from '../cache/client';
import { Client } from '../client';
import { getCacheName, isValkeyService } from './utils';

export const prepareLinkedClient = (context: EventContext, service: CacheService, options: DeployOptions): ContextSource => {
  const cacheState = getCacheState(context, service.name, options);
  const cacheId = cacheState.entryId;

  const endpoint = getDefinitionName<CacheState>(cacheId, 'writerEndpoint');

  return {
    module: 'Client',
    from: '@ez4/aws-valkey/client',
    constructor: `@{EZ4_MODULE_IMPORT}.make({ endpoint: ${endpoint}, debug: ${options.debug ?? false}})`,
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
      endpoint: connection.endpoint,
      port: connection.port,
      debug: options.debug,
      tls: false
    });
  }

  const cache = await importCache(undefined, getCacheName(service, options));

  if (!cache) {
    throw new CacheNotFoundError(service.name);
  }

  return Client.make({
    endpoint: cache.writerEndpoint,
    debug: options.debug
  });
};
