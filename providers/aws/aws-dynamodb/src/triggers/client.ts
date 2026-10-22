import type { DeployOptions, EmulateDescriptorEvent, EventContext, ContextSource } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';

import { getTableState } from '../table/utils';
import { getTableRepository } from '../utils/repository';
import { getConnectionOptions } from '../local/options';
import { getInternalName, isDynamoDbService } from './utils';

export const prepareLinkedClient = (context: EventContext, service: DatabaseService, options: DeployOptions): ContextSource => {
  const tableIds = service.tables.map((table) => {
    const internalName = getInternalName(service, table);
    const tableState = getTableState(context, internalName, options);

    return tableState.entryId;
  });

  const clientOptions = JSON.stringify({
    repository: getTableRepository(service, options),
    debug: options.debug
  });

  return {
    module: 'Client',
    from: '@ez4/aws-dynamodb/client',
    constructor: `@{EZ4_MODULE_IMPORT}.make(${clientOptions})`,
    dependencyIds: tableIds,
    connectionIds: tableIds
  };
};

export const prepareEmulatorDescriptor = (event: EmulateDescriptorEvent) => {
  const { service, options } = event;

  if (!isDynamoDbService(service)) {
    return null;
  }

  return {
    name: 'makeService',
    module: '@ez4/aws-dynamodb/worker',
    options: getEmulatorOptions(service, options)
  };
};

const getEmulatorOptions = (service: DatabaseService, options: EmulateDescriptorEvent['options']) => ({
  repository: getTableRepository(service, options),
  debug: options.debug,
  ...(options.local && {
    connection: getConnectionOptions(service, options)
  })
});
