import type { EmulateServiceEvent } from '@ez4/project/library';

import { getConnectionOptions } from '../local/options';
import { createAllTables, deleteAllTables } from '../local/tables';
import { getClientInstance } from '../client/utils';
import { isDynamoDbService } from './utils';

export const prepareEmulatorStart = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isDynamoDbService(service) && options.local) {
    const connection = getConnectionOptions(service, options);
    const client = getClientInstance(connection);

    await createAllTables(client, service, options);
  }
};

export const prepareEmulatorReset = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isDynamoDbService(service) && options.local) {
    const connection = getConnectionOptions(service, options);
    const client = getClientInstance(connection);

    await deleteAllTables(client, service, options);
  }
};
