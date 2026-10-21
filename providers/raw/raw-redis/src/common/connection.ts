import type { ClientConnection } from '../client/types';

import { MissingConnectionTokenError, UnsupportedConnectionError } from './errors';

export type ConnectionDriver = 'socket' | 'rest';

export const getConnectionDriver = (url: string): ConnectionDriver => {
  const protocol = URL.parse(url)?.protocol;

  switch (protocol) {
    case 'redis:':
    case 'rediss:':
      return 'socket';

    case 'https:':
    case 'http:':
      return 'rest';
  }

  throw new UnsupportedConnectionError(protocol);
};

export const assertConnection = (connection: ClientConnection) => {
  const driver = getConnectionDriver(connection.url);

  if (driver === 'rest' && !connection.token) {
    throw new MissingConnectionTokenError();
  }

  return driver;
};
