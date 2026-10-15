import type { Client as CacheClient, SetOptions } from '@ez4/cache';
import type { CacheDriver } from '../drivers/types';
import type { ClientConnection, ClientContext } from './types';

import { isAnyNumber } from '@ez4/utils';

import { createSocketDriver } from '../drivers/socket';
import { createRestDriver } from '../drivers/rest';
import { assertConnection } from '../common/connection';

const CACHE_DRIVERS: Record<string, CacheDriver> = {};

// Keys deleted per round trip when flushing.
const FLUSH_BATCH_SIZE = 500;

export namespace Client {
  export const make = (context: ClientContext): CacheClient => {
    const { identifier, prefix, connection, debug } = context;

    if (!CACHE_DRIVERS[identifier]) {
      CACHE_DRIVERS[identifier] = createDriver(connection, debug);
    }

    const driver = CACHE_DRIVERS[identifier];

    const getKey = (key: string) => {
      return `${prefix}${key}`;
    };

    return new (class {
      async get(key: string) {
        const value = await driver.send(['GET', getKey(key)]);

        return value === null || value === undefined ? undefined : String(value);
      }

      async set(key: string, value: string, options?: SetOptions) {
        if (isAnyNumber(options?.ttl)) {
          await driver.send(['SET', getKey(key), value, 'EX', options.ttl]);
        } else {
          await driver.send(['SET', getKey(key), value]);
        }
      }

      async setTTL(key: string, ttl: number) {
        return !!Number(await driver.send(['EXPIRE', getKey(key), ttl]));
      }

      async getTTL(key: string) {
        const ttl = Number(await driver.send(['TTL', getKey(key)]));

        return ttl > -1 ? ttl : undefined;
      }

      async rename(key: string, newKey: string) {
        return !!Number(await driver.send(['RENAMENX', getKey(key), getKey(newKey)]));
      }

      async delete(...keys: string[]) {
        if (!keys.length) {
          return 0;
        }

        return Number(await driver.send(['DEL', ...keys.map(getKey)]));
      }

      async exists(...keys: string[]) {
        if (!keys.length) {
          return 0;
        }

        return Number(await driver.send(['EXISTS', ...keys.map(getKey)]));
      }

      async increment(key: string, value?: number) {
        return Number(await driver.send(['INCRBY', getKey(key), value ?? 1]));
      }

      async decrement(key: string, value?: number) {
        return Number(await driver.send(['DECRBY', getKey(key), value ?? 1]));
      }

      async flush() {
        // Only the keys under this prefix, the server may be shared with other services.
        const pattern = `${escapePattern(prefix)}*`;

        let cursor = '0';

        do {
          const [nextCursor, keys] = (await driver.send(['SCAN', cursor, 'MATCH', pattern, 'COUNT', FLUSH_BATCH_SIZE])) as [
            string,
            string[]
          ];

          if (keys.length) {
            await driver.send(['DEL', ...keys]);
          }

          cursor = String(nextCursor);
        } while (cursor !== '0');
      }
    })();
  };

  export const dispose = (identifier: string) => {
    const driver = CACHE_DRIVERS[identifier];

    if (driver) {
      delete CACHE_DRIVERS[identifier];

      driver.dispose();
    }
  };
}

const createDriver = (connection: ClientConnection, debug?: boolean) => {
  const { url, token } = connection;

  if (assertConnection(connection) === 'rest') {
    return createRestDriver(url, token!);
  }

  return createSocketDriver(url, debug);
};

const escapePattern = (value: string) => {
  return value.replace(/[*?[\]\\]/g, '\\$&');
};
