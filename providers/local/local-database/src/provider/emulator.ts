import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';

export const registerDatabaseEmulator = async (service: DatabaseService, options: ServeOptions) => {
  const client = await triggerAllAsync('emulator:getClient', (handler) =>
    handler({
      service,
      options
    })
  );

  return {
    type: 'Database',
    name: service.name,
    identifier: getServiceName(service.name, options),
    clientHandler: () => {
      return client;
    }
  };
};
