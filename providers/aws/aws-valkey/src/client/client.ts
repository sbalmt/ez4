import { Runtime } from '@ez4/common';
import { Logger } from '@ez4/logger';

import Valkey from 'iovalkey';

export type ClientOperationCallback<T> = (client: Valkey) => Promise<T>;

export type ClientConnection = {
  endpoint: string;
  port?: number;
  tls?: boolean;
};

export const createCacheContext = (connection: ClientConnection, debug?: boolean) => {
  const { tls, endpoint, port = 6379 } = connection;

  const client = new Valkey({
    keepAlive: 0,
    connectTimeout: 10000,
    lazyConnect: true,
    host: endpoint,
    port,
    ...(tls !== false && {
      tls: {}
    })
  });

  let timeout: NodeJS.Timeout | undefined;

  let connected = false;

  const ensureConnection = async () => {
    if (!connected) {
      if (debug && Runtime.getScope()?.isLocal) {
        Logger.info(`Connecting to Valkey at ${endpoint}:${port}`);
      }

      await client.connect();
      connected = true;
    }
  };

  const forceDisconnect = () => {
    if (connected) {
      client.disconnect();
      connected = false;

      if (debug && Runtime.getScope()?.isLocal) {
        Logger.info(`Valkey at ${endpoint}:${port} was disconnected`);
      }
    }
  };

  const startIdleTimeout = () => {
    timeout = setTimeout(forceDisconnect, 1000);
  };

  const stopIdleTimeout = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  return {
    execute: async <T>(operation: ClientOperationCallback<T>) => {
      await ensureConnection();

      stopIdleTimeout();

      try {
        return await operation(client);
      } catch (error) {
        throw error;
      } finally {
        startIdleTimeout();
      }
    }
  };
};
