# EZ4: Storage

The Storage contract defines an object storage for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your storage configuration, event handlers, variables, and connected services, then generates the infrastructure and runtime bindings required to store files and react to storage events.

## Getting started

#### Install

```sh
npm install @ez4/storage @ez4/local-storage @ez4/aws-bucket -D
```

#### Create a storage

Storage is ideal for file uploads, media processing, static assets, backups, and event‑driven workflows triggered by object changes.

```ts
import type { Environment, Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

// MyStorage declaration
export declare class MyStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: 'uploads/';
      handler: typeof eventHandler;
    }>
  ];

  variables: {
    myVariable: Environment.Variable<'MY_VARIABLE'>;
  };

  tags: Bucket.UseTags<{
    Environment: 'production';
    Team: 'platform';
  }>;

  services: {
    otherService: Environment.Service<OtherService>;
    variables: Environment.ServiceVariables;
  };
}
```

#### Handle events

EZ4 injects all variables and services, and then invokes your event handler.

```ts
// MyStorage event handler
export function eventHandler(request: Bucket.Incoming, { otherService, variables }: Service.Context<MyStorage>): void {
  // Access event contents
  request.objectKey;

  // Access injected services
  otherService.call();

  // Access injected variables
  variables.myVariable;
}
```

> Listening to storage events is optional, so `events`, `services`, and `variables` can be omitted from the contract.

#### Use storage

Any handler with access to the storage service can read and write files.

```ts
import type { Service } from '@ez4/common';
import type { MyStorage } from './storage';

// Any other handler that has injected MyStorage service
export async function anotherHandler(_request: any, { myStorage }: Service.Context<AnotherService>) {
  // Write a file
  await myStorage.write('dummy.txt', 'Hello storage');

  // Read a file
  const content = await myStorage.read('dummy.txt');
}
```

> This makes it easy to store and retrieve files from anywhere in your application.

With your storage defined, EZ4 handles provisioning, synchronization, event routing, and execution automatically according to your contract.

## What's next

- [Storage service](./docs/storage-service.md)
- [Storage events](./docs/storage-events.md)
- [Storage handlers](./docs/storage-handlers.md)
- [Storage client](./docs/storage-client.md)

## Examples

- [Storage manager](../../examples/aws-storage-manager)

## Providers

- [Local provider](../../providers/local/local-storage)
- [AWS provider](../../providers/aws/aws-bucket)

## License

MIT License
