import type { EmulateServiceEvent } from '@ez4/project/library';

import { getTableRepository } from '@ez4/pgclient/library';

import { getConnectionOptions } from '../local/options';
import { createAllTables, deleteAllTables } from '../local/tables';
import { isRawPgService } from './utils';

export const prepareEmulatorStart = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (!isRawPgService(service)) {
    return;
  }

  const connection = getConnectionOptions(service, options);
  const repository = getTableRepository(service.tables);

  await createAllTables(connection, repository, options);
};

export const prepareEmulatorReset = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (!isRawPgService(service)) {
    return;
  }

  const connection = getConnectionOptions(service, options);
  const repository = getTableRepository(service.tables);

  await deleteAllTables(connection, repository);
};
