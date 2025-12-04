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
import type { Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

// MyStorage declaration
export declare class MyStorage extends Bucket.Service {
  autoExpireDays: 1;

  events: Bucket.UseEvents<{
    handler: typeof eventHandler;
  }>;

  services: {
    otherService: Environment.Service<OtherService>;
  };
}

// MyStorage event handler
export function eventHandler(request: Bucket.Event, context: Service.Context<FileStorage>): void {
  const { otherService } = context;

  // Access event contents
  // request.eventType

  // Access injected services
  // otherService.call()
}
```

#### Use storage

```ts
// file: handler.ts
import type { Service } from '@ez4/common';
import type { MyStorage } from './storage';

// Any other handler that has injected MyStorage service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myStorage } = context;

  await myStorage.write('dummy.txt', 'Hello storage');
}
```

## Storage properties

| Name           | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| globalName     | Overwrite the global bucket name.                                    |
| localPath      | Specify a local path to synchronize with the storage.                |
| autoExpireDays | Maximum amount of days an object is stored before its auto-deletion. |
| events         | Entry-point handler function for bucket events.                      |
| cors           | CORS configuration for the bucket.                                   |
| variables      | Environment variables associated to all subscription.                |
| services       | Injected services associated to handler function.                    |

#### Events

| Name         | Description                                          |
| ------------ | ---------------------------------------------------- |
| listener     | Life-cycle listener function for the event.          |
| handler      | Entry-point handler function for the event.          |
| path         | Path associated to the event.                        |
| variables    | Environment variables associated to handler.         |
| logRetention | Log retention (in days) for the handler.             |
| memory       | Memory available (in megabytes) for the handler.     |
| timeout      | Maximum execution time (in seconds) for the handler. |

## Examples

- [Storage manager](../../examples/aws-storage-manager)

## Providers

- [Local provider](../../providers/local/local-storage)
- [AWS provider](../../providers/aws/aws-bucket)

## License

MIT License
