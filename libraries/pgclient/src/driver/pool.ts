import { Pool } from 'pg';

export type ClientConnection =
  | {
      database: string;
      password: string;
      user: string;
      host: string;
      port?: number;
      ssl?: boolean | object;
      connectionString?: undefined;
    }
  | {
      database: string;
      connectionString: string;
      ssl?: boolean | object;
    };

export const createPool = (connection: ClientConnection) => {
  const baseOptions = {
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
    ssl: false,
    database,
    password,
    user,
    host,
    port
  });
};
