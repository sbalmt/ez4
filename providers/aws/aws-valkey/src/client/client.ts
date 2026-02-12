import { Runtime } from '@ez4/common';
import { Logger } from '@ez4/logger';

import Valkey from 'iovalkey';

export type ClientOperationCallback<T> = (client: Valkey) => Promise<T>;

export type CacheOperator = {
  execute: <T>(operation: ClientOperationCallback<T>) => Promise<T>;
};

export type ClientConnection = {
  endpoint: string;
  port?: number;
  tls?: boolean;
};

export const createCacheOperator = (connection: ClientConnection, debug?: boolean): CacheOperator => {
  const { tls, endpoint, port = 6379 } = connection;

  const client = new Valkey({
    connectTimeout: 10000,
    lazyConnect: true,
    host: endpoint,
    port,
    ...(tls !== false && {
      tls: {}
    })
  });

  if (Runtime.isRemote()) {
    return {
      execute: <T>(operation: ClientOperationCallback<T>) => {
        return operation(client);
      }
    };
  }

  let timerId: NodeJS.Timeout | undefined;

  client.on('ready', () => {
    if (debug && Runtime.isLocal()) {
      Logger.info(`Connected to Valkey at ${endpoint}:${port}`);
    }
  });

  client.on('close', () => {
    if (debug && Runtime.isLocal()) {
      Logger.info(`Valkey at ${endpoint}:${port} was disconnected`);
    }
  });

  const ensureConnection = async () => {
    if (client.status === 'wait' || client.status === 'end' || client.status === 'close') {
      await client.connect();
    }
  };

  const stopIdleTimer = () => {
    clearTimeout(timerId);
  };

  const startIdleTimer = () => {
    timerId = setTimeout(() => client.disconnect(false), 1000);
  };

  return {
    execute: async <T>(operation: ClientOperationCallback<T>) => {
      stopIdleTimer();

      await ensureConnection();

      try {
        return await operation(client);
      } catch (error) {
        throw error;
      } finally {
        startIdleTimer();
      }
    }
  };
};
