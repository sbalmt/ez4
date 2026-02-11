import type { EmulateServiceEvent } from '@ez4/project/library';

import { getConnectionOptions } from '../local/options';
import { deleteAllKeys } from '../local/keys';
import { isValkeyService } from './utils';

export const prepareEmulatorReset = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isValkeyService(service) && options.local) {
    const connection = getConnectionOptions(service, options);

    await deleteAllKeys(connection);
  }
};
