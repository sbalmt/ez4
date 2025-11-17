import type { EmulateServiceEvent } from '@ez4/project/library';

import { getTableRepository } from '@ez4/pgclient/library';

import { getConnectionOptions } from '../local/options';
import { createAllTables, deleteAllTables } from '../local/tables';
import { isAuroraService } from './utils';

export const prepareEmulatorStart = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isAuroraService(service) && options.local) {
    const connection = getConnectionOptions(service, options);
    const repository = getTableRepository(service.tables);

    await createAllTables(connection, repository, options);
  }
};

export const prepareEmulatorReset = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isAuroraService(service) && options.local) {
    const connection = getConnectionOptions(service, options);

    await deleteAllTables(connection);
  }
};
