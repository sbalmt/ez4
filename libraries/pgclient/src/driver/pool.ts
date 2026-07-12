import { Pool } from 'pg';

export type ClientConnection = {
  password: string;
  database: string;
  user: string;
  host: string;
  port?: number;
  ssl?: boolean | object;
  connectionString?: string;
};

export const createPool = (connection: ClientConnection) => {
  const { database, password, user, host, port, ssl, connectionString } = connection;

  const baseOptions = {
    allowExitOnIdle: true,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 15000,
    maxUses: 500,
    min: 0,
    max: 2,
    ssl
  };

  if (connectionString) {
    return new Pool({ ...baseOptions, connectionString });
  }

  return new Pool({
    ...baseOptions,
    ssl: false,
    database,
    password,
    user,
    host,
    port
  });
};
