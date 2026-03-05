import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';

import { PgClient } from '@ez4/pgclient';
import { Pool } from 'pg';

import { ClientDriver } from './client';

export type ClientConnection = {
  password: string;
  database: string;
  user: string;
  host: string;
  port?: number;
  ssl?: boolean;
};

export type ClientContext = {
  connection: ClientConnection;
  repository: PgTableRepository;
  debug?: boolean;
};

const DB_POOL: Record<string, Pool> = {};

export namespace Client {
  export const make = <T extends Database.Service>(context: ClientContext): DbClient<T> => {
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

  const createPool = (connection: ClientConnection) => {
    const { database, password, user, host, port, ssl } = connection;

    return new Pool({
      allowExitOnIdle: true,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 15000,
      maxUses: 500,
      min: 0,
      max: 2,
      database,
      password,
      user,
      host,
      port,
      ssl
    });
  };
}
