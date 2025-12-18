import type { DeployOptions, EmulateClientEvent, EventContext, ContextSource } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';

import { getTableState } from '../table/utils';
import { getTableRepository } from '../utils/repository';
import { getConnectionOptions } from '../local/options';
import { getClientInstance } from '../client/utils';
import { Client } from '../client';
import { getInternalName, isDynamoDbService } from './utils';

export const prepareLinkedClient = (context: EventContext, service: DatabaseService, options: DeployOptions): ContextSource => {
  const tableIds = service.tables.map((table) => {
    const internalName = getInternalName(service, table);
    const tableState = getTableState(context, internalName, options);

    return tableState.entryId;
  });

  return {
    connectionIds: tableIds,
    dependencyIds: tableIds,
    from: '@ez4/aws-dynamodb/client',
    module: 'Client',
    constructor: `make(${JSON.stringify({
      repository: getTableRepository(service, options),
      debug: options.debug
    })})`
  };
};

export const prepareEmulatorClient = (event: EmulateClientEvent) => {
  const { service, options } = event;

  if (!isDynamoDbService(service)) {
    return null;
  }

  if (options.local) {
    const connection = getConnectionOptions(service, options);

    return Client.make({
      repository: getTableRepository(service, options),
      client: getClientInstance(connection),
      debug: options.debug
    });
  }

  return Client.make({
    repository: getTableRepository(service, options),
    debug: options.debug
  });
};
