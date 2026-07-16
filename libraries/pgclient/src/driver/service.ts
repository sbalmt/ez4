import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { Pool } from 'pg';

import { PgClient } from '@ez4/pgclient';

import { ClientDriver } from './client';
import { createPool, type ClientConnection } from './pool';

export type ClientContext = {
  connection: ClientConnection;
  repository: PgTableRepository;
  debug?: boolean;
};

const DB_POOL: Record<string, Pool> = {};

export namespace Client {
  export const make = <T extends Database.Service<any>>(context: ClientContext): DbClient<T> => {
    const { connection, repository, debug } = context;
    const { database } = connection;

    if (!DB_POOL[database]) {
      DB_POOL[database] = createPool(connection);
    }

    return PgClient.make({
      driver: new ClientDriver(DB_POOL[database]),
      repository,
      debug
    });
  };
}
