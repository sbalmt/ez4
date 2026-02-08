import type { Client as CacheClient } from '@ez4/cache';

import Valkey from 'iovalkey';

export type ClientContext = {
  endpoint: string;
  debug?: boolean;
  port?: number;
  tls?: boolean;
};

export namespace Client {
  export const make = (context: ClientContext): CacheClient => {
    const client = new Valkey({
      host: context.endpoint,
      port: context.port,
      ...(context.tls !== false && {
        tls: {}
      })
    });

    return new (class {
      async get(key: string) {
        return (await client.get(key)) ?? undefined;
      }

      async set(key: string, value: string) {
        await client.set(key, value);
      }
    })();
  };
}
