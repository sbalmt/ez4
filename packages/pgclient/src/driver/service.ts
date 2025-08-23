import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';

import { PgClient } from '@ez4/pgclient';
import { Pool } from 'pg';

import { ClientDriver } from './client.js';

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

const DatabasePools: Record<string, Pool> = {};

export namespace Client {
  export const make = async <T extends Database.Service>(context: ClientContext): Promise<DbClient<T>> => {
    const { connection, repository, debug } = context;
    const { database } = connection;

    if (!DatabasePools[database]) {
      DatabasePools[database] = createPool(connection);
    }

    return PgClient.make({
      driver: new ClientDriver(DatabasePools[database]),
      repository,
      debug
    });
  };

  const createPool = (connection: ClientConnection) => {
    const { database, password, user, host, port, ssl } = connection;

    return new Pool({
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: true,
      keepAlive: false,
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
