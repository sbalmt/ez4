# @ez4/raw-redis

EZ4 provider for **external Redis**: connect to any Redis-compatible server
(managed services, Valkey, KeyDB, Dragonfly, self-hosted) instead of
provisioning AWS ElastiCache.

The same `Cache.Service` declarations work, only the engine changes. Two drivers
are supported and the connection URL selects one:

| URL                              | Driver                                  |
| -------------------------------- | --------------------------------------- |
| `redis://…` / `rediss://…` (TLS) | Redis protocol over TCP (any server)    |
| `https://…`                      | Redis REST API (stateless HTTP request) |

> No VPC is required: the Lambda functions reach the server through the internet.

## Install

```sh
npm install @ez4/raw-redis @ez4/cache @ez4/local-cache
```

In your app code, import the engine type and reference it in the service:

```ts
import type { RedisEngine } from '@ez4/raw-redis/client';
import type { Cache } from '@ez4/cache';

export declare class MyCache extends Cache.Service {
  engine: RedisEngine;
}
```

Any handler with access to the cache service can use it as usual:

```ts
await myCache.set('key', 'value', { ttl: 60 });

const value = await myCache.get('key');
```

## Connection convention

The provider reads the connection from env vars named after the service:

```
EZ4_RAW_REDIS_<SERVICE_NAME_SNAKE_UPPER>_URL
EZ4_RAW_REDIS_<SERVICE_NAME_SNAKE_UPPER>_TOKEN   (REST only)
```

Examples:

- Service `MyCache` → `EZ4_RAW_REDIS_MY_CACHE_URL`
- Self-hosted → `rediss://user:password@cache.example.com:6380`
- Managed (TLS) → `rediss://default:<password>@<host>:6379`
- REST API → `https://<host>` with `EZ4_RAW_REDIS_MY_CACHE_TOKEN=<token>`

The variables are required at deploy time and propagated to the deployed Lambda
as runtime env vars.

## Key prefix

All keys are prefixed with the service name (`<prefix>-<project>-<branch>-<service>:`),
so different projects and stages can share the same server without collisions.

For the same reason, `flush()` only deletes the keys under that prefix (`SCAN` + `DEL`)
instead of `FLUSHALL`.

## Local development

`ez4.project.js`:

```js
export default {
  // ...
  localOptions: {
    my_cache: {
      url: process.env.EZ4_RAW_REDIS_MY_CACHE_URL,
      token: process.env.EZ4_RAW_REDIS_MY_CACHE_TOKEN
    }
  }
};
```

> Without `localOptions`, the same env vars used by the deploy are read.

Then:

```sh
ez4 serve -e local.env
```

Reset (deletes only the keys under the service prefix):

```sh
ez4 serve --local --reset
```

## Timeouts and failures

A cache should fail fast instead of holding the caller. Both drivers limit
connecting and each command to 2 seconds. Only the first TCP connection is
awaited: while the connection is down, commands fail right away instead of
waiting in a queue, and the driver keeps reconnecting in background. A command
that times out also forces a reconnection, since a connection silently dropped
(e.g. while the function was frozen) would otherwise time out every command.

Errors are thrown to the caller, so you can decide whether a cache failure is
a miss (e.g. fallback to the database) or an error (e.g. rate limiting).

## Choosing a driver

- **REST** fits short-lived functions best: no connection to keep alive, no
  connection limits and no handshake per cold start beyond HTTPS.
- **TCP** works with any server and has lower latency per command once the
  connection is open (reused across invocations of the same container).

## Limitations

- **Plaintext env**: the connection URL and token end up in the Lambda's env vars,
  visible in the AWS console.
- **No provisioning**: the server must already exist.
- **Exposed servers**: since Lambda functions don't have fixed egress IPs, a
  self-hosted server must be reachable from the internet. Use TLS (`rediss://`),
  an ACL user with a strong password and without dangerous commands.

## See also

- `examples/hello-raw-redis`: minimal seed using this provider.
- `@ez4/aws-valkey`: same client API against AWS-managed Valkey.

## License

MIT License
