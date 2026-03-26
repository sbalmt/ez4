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
```

#### Handle events

EZ4 injects all variables and services, and then invokes your event handler.

```ts
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

> Listening to storage events is optional, so `events`, `services`, and `variables` can be omitted from the contract.

#### Use storage

Any handler with access to the storage service can read and write files.

```ts
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

> This makes it easy to store and retrieve files from anywhere in your application.

With your storage defined, EZ4 handles provisioning, synchronization, event routing, and execution automatically according to your contract.

## Storage properties

#### Service

| Name           | Type               | Description                                                  |
| -------------- | ------------------ | ------------------------------------------------------------ |
| events         | Bucket.UseEvents<> | Entry-point handler for storage events.                      |
| cors           | Bucket.UseCors<>   | CORS configuration for the storage.                          |
| globalName     | string             | Overwrite the global storage name.                           |
| localPath      | string             | Specify a local path to synchronize with the storage.        |
| autoExpireDays | integer            | Amount of days an object is stored before its auto-deletion. |
| variables      | object             | Environment variables associated with the event handler.     |
| services       | object             | Injected services associated with handler function.          |

> Use type helpers for `events`, `cors` properties.

#### Events

| Name         | Type             | Description                                                 |
| ------------ | ---------------- | ----------------------------------------------------------- |
| listener     | function         | Life-cycle listener function for the event.                 |
| handler      | function         | Entry-point handler function for the event.                 |
| path         | string           | Path associated with the event handler.                     |
| variables    | object           | Environment variables associated with the handler.          |
| logRetention | integer          | Log retention (in days) for the handler.                    |
| logLevel     | LogLevel         | Log level for the handler.                                  |
| architecture | ArchitectureType | Architecture type for the cloud function.                   |
| runtime      | RuntimeType      | Runtime for the cloud function.                             |
| files        | string[]         | Additional resource files added into the handler bundle.    |
| timeout      | integer          | Maximum execution time (in seconds) for the handler.        |
| memory       | integer          | Memory available (in megabytes) for the handler.            |
| debug        | boolean          | Determine whether the debug mode is active for the handler. |
| vpc          | boolean          | Determines whether or not VPC is enabled for the handler.   |

## Examples

- [Storage manager](../../examples/aws-storage-manager)

## Providers

- [Local provider](../../providers/local/local-storage)
- [AWS provider](../../providers/aws/aws-bucket)

## License

MIT License
