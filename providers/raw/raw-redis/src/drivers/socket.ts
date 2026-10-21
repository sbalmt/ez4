import type { CacheDriver } from './types';

import { Runtime } from '@ez4/runtime';
import { Logger } from '@ez4/logger';

import Redis from 'ioredis';

import { DRIVER_TIMEOUT } from './types';

/**
 * Redis protocol driver (TCP), `rediss://` enables TLS.
 */
export const createSocketDriver = (url: string, debug?: boolean): CacheDriver => {
  const client = new Redis(url, {
    // Keep reconnecting in background, while the connection is down commands fail right away
    // instead of waiting in the offline queue.
    retryStrategy: (times) => Math.min(times * 200, DRIVER_TIMEOUT),
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: DRIVER_TIMEOUT,
    commandTimeout: DRIVER_TIMEOUT,
    lazyConnect: true
  });

  let connecting: Promise<void> | undefined;

  // Only the first connection is awaited, reconnections happen in background.
  const ensureConnection = () => {
    if (client.status === 'wait' && !connecting) {
      connecting = client.connect().finally(() => {
        connecting = undefined;
      });
    }

    return connecting;
  };

  const { host, port } = client.options;

  client.on('error', (error) => {
    if (debug) {
      Logger.error(`Redis at ${host}:${port} failed: ${error.message}`);
    }
  });

  if (debug && Runtime.isLocal()) {
    client.on('ready', () => {
      Logger.info(`Connected to Redis at ${host}:${port}`);
    });

    client.on('close', () => {
      Logger.info(`Redis at ${host}:${port} was disconnected`);
    });
  }

  return {
    send: async ([command, ...args]) => {
      await ensureConnection();

      try {
        return await client.call(String(command), args);
      } catch (error) {
        // A timeout doesn't close the connection, and one silently dropped (e.g. while the function
        // was frozen) would time out every command until the OS notices, so reconnect right away.
        if (isTimeoutError(error)) {
          client.disconnect(true);
        }

        throw error;
      }
    },
    dispose: () => {
      client.disconnect(false);
    }
  };
};

const isTimeoutError = (error: unknown) => {
  return error instanceof Error && error.message === 'Command timed out';
};
