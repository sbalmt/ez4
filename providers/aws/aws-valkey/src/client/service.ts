import type { Client as CacheClient, SetOptions } from '@ez4/cache';
import type { ClientConnection } from './client';

import { isAnyNumber } from '@ez4/utils';

import { createCacheContext } from './client';

export type ClientContext = {
  connection: ClientConnection;
  debug?: boolean;
};

export namespace Client {
  export const make = (context: ClientContext): CacheClient => {
    const cache = createCacheContext(context.connection);

    return new (class {
      get(key: string) {
        return cache.execute(async (client) => {
          return (await client.get(key)) ?? undefined;
        });
      }

      set(key: string, value: string, options?: SetOptions) {
        return cache.execute(async (client) => {
          if (isAnyNumber(options?.ttl)) {
            await client.setex(key, options.ttl, value);
          } else {
            await client.set(key, value);
          }
        });
      }

      setTTL(key: string, ttl: number) {
        return cache.execute(async (client) => {
          return !!(await client.expire(key, ttl));
        });
      }

      getTTL(key: string) {
        return cache.execute(async (client) => {
          const ttl = await client.ttl(key);
          return ttl > -1 ? ttl : undefined;
        });
      }

      rename(keys: string, newkey: string) {
        return cache.execute(async (client) => {
          return !!(await client.renamenx(keys, newkey));
        });
      }

      delete(...keys: string[]) {
        return cache.execute((client) => {
          return client.del(...keys);
        });
      }

      exists(...keys: string[]) {
        return cache.execute((client) => {
          return client.exists(...keys);
        });
      }

      increment(key: string, value?: number) {
        return cache.execute((client) => {
          return client.incrby(key, value ?? 1);
        });
      }

      decrement(key: string, value?: number) {
        return cache.execute((client) => {
          return client.decrby(key, value ?? 1);
        });
      }

      flush() {
        return cache.execute(async (client) => {
          await client.flushall();
        });
      }
    })();
  };
}
