import type { EmulateClientEvent } from '@ez4/project/library';

import { getTableRepository } from '@ez4/pgclient/library';
import { Client as NativeClient } from '@ez4/pgclient';

import { getConnectionOptions } from '../local/options';
import { isRawPgService } from './utils';

export const prepareEmulatorClient = (event: EmulateClientEvent) => {
  const { service, options } = event;

  if (!isRawPgService(service)) {
    return null;
  }

  const connection = getConnectionOptions(service, options);

  const instance = NativeClient.make({
    debug: options.debug,
    repository: getTableRepository(service.tables),
    connection
  });

  return {
    make: () => instance
  };
};
