import { Pool } from 'pg';

export type ClientConnection = {
  password: string;
  database: string;
  user: string;
  host: string;
  port?: number;
};

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
