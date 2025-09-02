import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { DataClientConnection } from './driver';

import { PgClient } from '@ez4/pgclient';

import { DataClientDriver } from './driver';

export type ClientContext = {
  connection: DataClientConnection;
  repository: PgTableRepository;
  debug?: boolean;
};

export namespace Client {
  export const make = <T extends Database.Service>(context: ClientContext): DbClient<T> => {
    const { connection, repository, debug } = context;

    return PgClient.make({
      driver: new DataClientDriver(connection),
      repository,
      debug
    });
  };
}
