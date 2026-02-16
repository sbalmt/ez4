import type { Client as CacheClient, SetOptions } from '@ez4/cache';
import type { ClientConnection, CacheOperator } from './client';

import { isAnyNumber } from '@ez4/utils';

import { CacheOperatorNotFoundError } from './errors';
import { createCacheOperator } from './client';

export type ClientContext = {
  connection: ClientConnection;
  identifier: string;
  debug?: boolean;
};

const CACHE_OPERATORS: Record<string, CacheOperator> = {};

export namespace Client {
  export const make = (context: ClientContext): CacheClient => {
    const { connection, identifier, debug } = context;

    if (!CACHE_OPERATORS[identifier]) {
      CACHE_OPERATORS[identifier] = createCacheOperator(connection, debug);
    }

    const operator = CACHE_OPERATORS[identifier];

    return new (class {
      get(key: string) {
        return operator.execute(async (client) => {
          return (await client.get(key)) ?? undefined;
        });
      }

      set(key: string, value: string, options?: SetOptions) {
        return operator.execute(async (client) => {
          if (isAnyNumber(options?.ttl)) {
            await client.setex(key, options.ttl, value);
          } else {
            await client.set(key, value);
          }
        });
      }

      setTTL(key: string, ttl: number) {
        return operator.execute(async (client) => {
          return !!(await client.expire(key, ttl));
        });
      }

      getTTL(key: string) {
        return operator.execute(async (client) => {
          const ttl = await client.ttl(key);
          return ttl > -1 ? ttl : undefined;
        });
      }

      rename(keys: string, newkey: string) {
        return operator.execute(async (client) => {
          return !!(await client.renamenx(keys, newkey));
        });
      }

      delete(...keys: string[]) {
        return operator.execute((client) => {
          return client.del(...keys);
        });
      }

      exists(...keys: string[]) {
        return operator.execute((client) => {
          return client.exists(...keys);
        });
      }

      increment(key: string, value?: number) {
        return operator.execute((client) => {
          return client.incrby(key, value ?? 1);
        });
      }

      decrement(key: string, value?: number) {
        return operator.execute((client) => {
          return client.decrby(key, value ?? 1);
        });
      }

      flush() {
        return operator.execute(async (client) => {
          await client.flushall();
        });
      }
    })();
  };

  export const dispose = (identifier: string) => {
    const operator = CACHE_OPERATORS[identifier];

    if (!operator) {
      throw new CacheOperatorNotFoundError(identifier);
    }

    delete CACHE_OPERATORS[identifier];

    operator.dispose();
  };
}
