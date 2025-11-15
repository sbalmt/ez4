import type { EmulateServiceEvent } from '@ez4/project/library';

import { getConnectionOptions } from '../local/options';
import { LocalOptionsNotFoundError } from '../local/errors';
import { applyMigration } from '../local/migration';
import { getClientInstance } from '../client/utils';
import { isDynamoDbService } from './utils';

export const prepareEmulatorStart = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isDynamoDbService(service) && options.local) {
    const connection = getConnectionOptions(service, options);

    if (!connection) {
      throw new LocalOptionsNotFoundError(service.name);
    }

    const client = getClientInstance(connection);

    await applyMigration(client, service, options);
  }
};
