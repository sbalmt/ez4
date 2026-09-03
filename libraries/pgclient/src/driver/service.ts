import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ClientConnection } from '../types/connection';

import { Pool, types } from 'pg';

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

/**
 * Column types this driver hands back as text, because the Data API driver does.
 *
 * Both drivers answer the same queries, and `parseRecords` reconciles what they return against the
 * table schema — which a raw query never has. So for a raw query, whatever the driver returns is
 * what the caller gets, and the two disagree: `pg` parses JSON into an object, while the Data API
 * has no such step and returns its text.
 *
 * That difference is invisible until deployment. Code written against this driver reads the object,
 * passes its tests, and then reads a string in front of the other one — where the usual guards
 * (`Array.isArray`, a cast, a spread) report the value as absent rather than failing.
 *
 * Only JSON is normalized here. `pg` also reads timestamps into `Date`, but every datetime the
 * query builder selects is already rendered by `to_char`, so a raw query is the only place a bare
 * one appears — and there the divergence is visible: a `Date` is not a string, and code reaching
 * for one gets an error rather than a wrong answer.
 */
const TEXT_TYPES = new Set<number>([types.builtins.JSON, types.builtins.JSONB]);

const getTypeParser = ((oid: number, format?: never) => {
  return TEXT_TYPES.has(oid) ? (value: string) => value : types.getTypeParser(oid, format);
}) as typeof types.getTypeParser;

export const createPool = (connection: ClientConnection) => {
  const baseOptions = {
    types: { getTypeParser },
    allowExitOnIdle: true,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 15000,
    maxUses: 500,
    min: 0,
    max: 2,
    ssl: connection.ssl
  };

  if ('connectionString' in connection && connection.connectionString) {
    return new Pool({ ...baseOptions, connectionString: connection.connectionString });
  }

  const { database, password, user, host, port } = connection as Extract<ClientConnection, { host: string }>;

  return new Pool({
    ...baseOptions,
    ssl: connection.ssl ?? false,
    database,
    password,
    user,
    host,
    port
  });
};
