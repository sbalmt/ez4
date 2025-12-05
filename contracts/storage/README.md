# EZ4: Storage

It uses the power of [reflection](../../foundation/reflection/) to provide a contract that determines how to build and connect storage components.

## Getting started

#### Install

```sh
npm install @ez4/storage @ez4/local-storage @ez4/aws-bucket -D
```

#### Create storage

```ts
// file: storage.ts
import type { Environment, Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

// MyStorage declaration
export declare class MyStorage extends Bucket.Service {
  autoExpireDays: 1;

  events: Bucket.UseEvents<{
    handler: typeof eventHandler;
  }>;

  variables: {
    myVariable: Environment.Variable<'MY_VARIABLE'>;
  };

  services: {
    otherService: Environment.Service<OtherService>;
    variables: Environment.ServiceVariables;
  };
}

// MyStorage event handler
export function eventHandler(request: Bucket.Event, context: Service.Context<MyStorage>): void {
  const { otherService, variables } = context;

  // Access event contents
  request.eventType;

  // Access injected services
  otherService.call();

  // Access injected variables
  variables.myVariable;
}
```

> Listening to bucket events is optional, so `events`, `services`, and `variables` can be omitted.

#### Use storage

```ts
// file: handler.ts
import type { Service } from '@ez4/common';
import type { MyStorage } from './storage';

// Any other handler that has injected MyStorage service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myStorage } = context;

  // Write a file
  await myStorage.write('dummy.txt', 'Hello storage');

  // Read a file
  const content = myStorage.read('dummy.txt');
}
```

## Storage properties

#### Service

| Name           | Type               | Description                                                  |
| -------------- | ------------------ | ------------------------------------------------------------ |
| events         | Bucket.UseEvents<> | Entry-point handler for bucket events.                       |
| cors           | Bucket.UseCors<>   | CORS configuration for the bucket.                           |
| globalName     | string             | Overwrite the global bucket name.                            |
| localPath      | string             | Specify a local path to synchronize with the storage.        |
| autoExpireDays | integer            | Amount of days an object is stored before its auto-deletion. |
| variables      | object             | Environment variables associated to the event handler.       |
| services       | object             | Injected services associated to handler function.            |

> Use type helpers for `events`, `cors` properties.

#### Events

| Name         | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| listener     | function | Life-cycle listener function for the event.          |
| handler      | function | Entry-point handler function for the event.          |
| path         | string   | Path associated to the event.                        |
| variables    | object   | Environment variables associated to handler.         |
| logRetention | integer  | Log retention (in days) for the handler.             |
| timeout      | integer  | Maximum execution time (in seconds) for the handler. |
| memory       | integer  | Memory available (in megabytes) for the handler.     |

## Examples

- [Storage manager](../../examples/aws-storage-manager)

## Providers

- [Local provider](../../providers/local/local-storage)
- [AWS provider](../../providers/aws/aws-bucket)

## License

MIT License
