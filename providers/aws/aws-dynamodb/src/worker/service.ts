import type { ClientContext } from '../client/service';
import type { ClientInstanceOptions } from '../client/utils/instance';

import { getClientInstance } from '../client/utils/instance';
import { Client } from '../client/service';

export type ServiceOptions = Omit<ClientContext, 'client'> & {
  connection?: ClientInstanceOptions;
};

export const makeService = (options: ServiceOptions) => {
  const { connection, repository, debug } = options;

  return () =>
    Client.make({
      debug,
      repository,
      ...(connection && {
        client: getClientInstance(options.connection)
      })
    });
};
