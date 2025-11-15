import type { EmulateServiceEvent } from '@ez4/project/library';

import { getTableRepository } from '@ez4/pgclient/library';

import { LocalOptionsNotFoundError } from '../local/errors';
import { ensureDatabase, ensureMigration } from '../local/migration';
import { getConnectionOptions } from '../local/options';
import { isAuroraService } from './utils';

export const prepareEmulatorStart = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isAuroraService(service) && options.local) {
    const connection = getConnectionOptions(service, options);

    if (!connection) {
      throw new LocalOptionsNotFoundError(service.name);
    }

    const repository = getTableRepository(service.tables);

    await ensureDatabase(connection);

    await ensureMigration(connection, repository, options.force);
  }
};
