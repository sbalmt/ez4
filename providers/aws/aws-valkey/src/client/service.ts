import type { Client as CacheClient, SetOptions } from '@ez4/cache';

import { isAnyNumber } from '@ez4/utils';

import { createCacheContext } from './client';

export type ClientContext = {
  endpoint: string;
  debug?: boolean;
  port?: number;
  tls?: boolean;
};

export namespace Client {
  export const make = (context: ClientContext): CacheClient => {
    const cache = createCacheContext(context);

    return new (class {
      async get(key: string) {
        return cache.execute(async (client) => {
          return (await client.get(key)) ?? undefined;
        });
      }

      async set(key: string, value: string, options?: SetOptions) {
        return cache.execute(async (client) => {
          if (isAnyNumber(options?.ttl)) {
            await client.setex(key, options.ttl, value);
          } else {
            await client.set(key, value);
          }
        });
      }

      async expire(key: string, ttl: number) {
        return cache.execute(async (client) => {
          return !!(await client.expire(key, ttl));
        });
      }

      async delete(...keys: string[]) {
        return cache.execute((client) => {
          return client.del(...keys);
        });
      }

      async exists(...keys: string[]) {
        return cache.execute((client) => {
          return client.exists(...keys);
        });
      }
    })();
  };
}
