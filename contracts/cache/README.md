# EZ4: Cache

The Cache contract defines a key‑value caching service for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your cache configuration, engine selection, variables, and connected services, then generates the infrastructure and the runtime bindings required to store and retrieve cached values.

## Getting started

#### Install

```sh
npm install @ez4/cache @ez4/local-cache @ez4/aws-valkey -D
```

#### Create a cache

Caching is ideal for session data, computed results, rate‑limiting, temporary state, and any workflow that benefits from fast, ephemeral storage.

```ts
import type { Environment, Service } from '@ez4/common';
import type { Cache } from '@ez4/cache';

// MyCache declaration
export declare class MyCache extends Cache.Service {
  engine: Cache.UseEngine<{
    name: 'valkey';
  }>;
}
```

> Cache services usually don't require variables or injected services.

#### Use cache

Any handler with access to the cache service can read and write cached values.

```ts
import type { Service } from '@ez4/common';
import type { MyCache } from './cache';

// Any other handler that has injected MyCache service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myCache } = context;

  await myCache.set('key', 'value');

  const value = myCache.get('key');
}
```

> This makes it easy to store and retrieve fast, ephemeral data from anywhere in your application.

With your cache service defined, EZ4 handles provisioning and runtime wiring automatically according to your contract.

## Cache properties

#### Service

| Name   | Type              | Description                           |
| ------ | ----------------- | ------------------------------------- |
| engine | Cache.UseEngine<> | Determines which cache engine to use. |

> Use type helper for the `engine` property.

## Examples

- [Get started with cache](../../examples/hello-aws-cache)

## Providers

- [AWS provider](../../providers/aws/aws-valkey)
- [Local provider](../../providers/local/local-cache)

## License

MIT License
