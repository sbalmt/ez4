import type { ClientContext } from '@ez4/aws-dynamodb/client';
import type { ClientInstanceOptions } from '../client/instance';

import { Client } from '@ez4/aws-dynamodb/client';

import { getClientInstance } from '../client/instance';

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
