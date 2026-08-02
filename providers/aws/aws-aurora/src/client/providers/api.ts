import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ApiClientConnection } from '../drivers/api';

import { PgClient } from '@ez4/pgclient';

import { ApiClientDriver } from '../drivers/api';

export type ApiClientContext = {
  connection: ApiClientConnection;
  repository: PgTableRepository;
  debug?: boolean;
};

export namespace Client {
  export const make = <T extends Database.Service<any>>(context: ApiClientContext): DbClient<T> => {
    const { connection, repository, debug } = context;

    return PgClient.make({
      driver: new ApiClientDriver(connection),
      repository,
      debug
    });
  };
}
