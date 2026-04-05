# EZ4: Queue

The Queue contract defines an asynchronous message queue for your application. It uses EZ4's [reflection](../../foundation/reflection/) to analyze your message type, subscriptions, variables, and connected services, then generates the infrastructure and runtime bindings required to process messages.

## Getting started

#### Install

```sh
npm install @ez4/queue @ez4/local-queue @ez4/aws-queue -D
```

#### Create a queue

Queues are ideal for background jobs, event processing, fan‑out workflows, and decoupled communication between services.

```ts
import type { Environment, Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';

// MyQueue message
type MyQueueMessage = {
  foo: string;
  bar: number;
};

// MyQueue declaration
export declare class MyQueue extends Queue.Unordered<MyQueueMessage> {
  retention: 600;

  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof eventHandler;
    }>
  ];

  variables: {
    myVariable: Environment.Variable<'MY_VARIABLE'>;
  };

  services: {
    otherService: Environment.Service<OtherService>;
    variables: Environment.ServiceVariables;
  };
}
```

#### Handle messages

EZ4 validates the incoming message, injects all variables and services, and then invokes your subscription handler.

```ts
// MyQueue message handler
export function eventHandler(request: Queue.Incoming<MyQueueMessage>, context: Service.Context<MyQueue>): void {
  const { otherService, variables } = context;
  const { message } = request;

  // Access message contents
  message.foo;

  // Access injected services
  otherService.call();

  // Access injected variables
  variables.myVariable;
}
```

#### Send messages

Any handler with access to the queue service can send messages.

```ts
import type { Service } from '@ez4/common';
import type { MyQueue } from './queue';

// Any other handler that has injected MyQueue service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myQueue } = context;

  await myQueue.sendMessage({
    foo: 'foo',
    bar: 123
  });
}
```

> This makes it easy to trigger background work from any part of your application.

With your queue defined, EZ4 handles provisioning, message routing, retries, and execution according to your contract.

## Queue properties

#### Service

| Name          | Type                    | Description                                                        |
| ------------- | ----------------------- | ------------------------------------------------------------------ |
| fifoMode      | Queue.UseFifoMode<>     | Enable and configure the FIFO mode options.                        |
| deadLetter    | Queue.UseDeadLetter<>   | Enable and configure the dead-letter queue options.                |
| subscriptions | Queue.UseSubscription<> | All subscriptions associated with the queue.                       |
| delay         | integer                 | Maximum delay (in seconds) to make messages available.             |
| polling       | integer                 | Maximum wait time (in seconds) for receiving messages.             |
| retention     | integer                 | Maximum retention time (in minutes) for all messages in the queue. |
| timeout       | integer                 | Maximum acknowledge time (in seconds) for the handler.             |
| variables     | object                  | Environment variables associated with all subscriptions.           |
| services      | object                  | Injected services associated with all subscriptions.               |

> Use type helpers for `fifoMode`, `deadLetter` and `subscriptions` properties.

#### Subscriptions

| Name         | Type             | Description                                                 |
| ------------ | ---------------- | ----------------------------------------------------------- |
| listener     | function         | Life-cycle listener function for the subscription.          |
| handler      | function         | Entry-point handler function for the subscription.          |
| variables    | object           | Environment variables associated with the subscription.     |
| logRetention | integer          | Log retention (in days) for the handler.                    |
| logLevel     | LogLevel         | Log level for the handler.                                  |
| architecture | ArchitectureType | Architecture type for the cloud function.                   |
| runtime      | RuntimeType      | Runtime for the cloud function.                             |
| files        | string[]         | Additional resource files added into the handler bundle.    |
| memory       | integer          | Memory available (in megabytes) for the handler.            |
| concurrency  | integer          | Maximum number of concurrent executions handlers.           |
| batch        | integer          | Maximum number of messages per handler invocation.          |
| debug        | boolean          | Determine whether the debug mode is active for the handler. |
| vpc          | boolean          | Determines whether or not VPC is enabled for the handler.   |

## Examples

- [Get started with queue](../../examples/hello-aws-queue)
- [Importing queue](../../examples/aws-import-queue)

## Providers

- [Local provider](../../providers/local/local-queue)
- [AWS provider](../../providers/aws/aws-queue)

## License

MIT License
