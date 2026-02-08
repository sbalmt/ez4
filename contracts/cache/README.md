# EZ4: Cache

It uses the power of [reflection](../../foundation/reflection/) to provide a contract that determines how to build and connect cache components.

## Getting started

#### Install

```sh
npm install @ez4/cache @ez4/local-cache @ez4/aws-valkey -D
```

#### Create cache

```ts
// file: cache.ts
import type { Environment, Service } from '@ez4/common';
import type { Cache } from '@ez4/email';

// MyCache declaration
export declare class MyCache extends Cache.Service {
  engine: Cache.UseEngine<{
    name: 'valkey
  }>
}
```

#### Use cache

```ts
// file: handler.ts
import type { Service } from '@ez4/common';
import type { MyCache } from './cache';

// Any other handler that has injected MyCache service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myCache } = context;

  await myCache.set('key', 'value');

  const value = myCache.get('key');
}
```

## Cache properties

#### Service

| Name   | Type              | Description                              |
| ------ | ----------------- | ---------------------------------------- |
| engine | Cache.UseEngine<> | Determines which database engine to use. |

## Examples

- [Get started with cache](../../examples/hello-aws-cache)

## Providers

- [AWS provider](../../providers/aws/aws-valkey)
- [Local provider](../../providers/local/local-cache)

## License

MIT License
