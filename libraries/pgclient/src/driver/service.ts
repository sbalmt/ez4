import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ClientConnection } from '../types/connection';

import { Pool } from 'pg';

import { PgClient } from '@ez4/pgclient';

import { ClientDriver } from './client';

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

export const createPool = (connection: ClientConnection) => {
  const { database, password, user, host, port } = connection;

  return new Pool({
    allowExitOnIdle: true,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 15000,
    ssl: false,
    maxUses: 500,
    min: 0,
    max: 2,
    database,
    password,
    user,
    host,
    port
  });
};
