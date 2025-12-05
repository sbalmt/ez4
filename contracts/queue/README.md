# EZ4: Queue

It uses the power of [reflection](../../foundation/reflection/) to provide a contract that determines how to build and connect queue components.

## Getting started

#### Install

```sh
npm install @ez4/queue @ez4/local-queue @ez4/aws-queue -D
```

#### Create queue

```ts
// file: queue.ts
import type { Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';

// MyQueue message
type MyQueueMessage = {
  foo: string;
  bar: number;
};

// MyQueue declaration
export declare class MyQueue extends Queue.Service<MyQueueMessage> {
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

#### Use queue

```ts
// file: handler.ts
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

## Queue properties

| Name          | Type                    | Description                                                        |
| ------------- | ----------------------- | ------------------------------------------------------------------ |
| fifoMode      | Queue.UseFifoMode<>     | Enable and configure the FIFO mode options.                        |
| deadLetter    | Queue.UseDeadLetter<>   | Enable and configure the dead-letter queue options.                |
| subscriptions | Queue.UseSubscription<> | All subscriptions associated to the queue.                         |
| delay         | integer                 | Maximum delay (in seconds) to make messages available.             |
| polling       | integer                 | Maximum wait time (in seconds) for receiving messages.             |
| retention     | integer                 | Maximum retention time (in minutes) for all messages in the queue. |
| timeout       | integer                 | Maximum acknowledge time (in seconds) for the handler.             |
| variables     | object                  | Environment variables associated to all subscription.              |
| services      | object                  | Injected services associated to all subscription.                  |

> Use type helpers for `fifoMode`, `deadLetter` and `subscriptions` properties.

#### Subscriptions

| Name         | Type     | Description                                           |
| ------------ | -------- | ----------------------------------------------------- |
| listener     | function | Life-cycle listener function for the subscription.    |
| handler      | function | Entry-point handler function for the subscription.    |
| concurrency  | integer  | Maximum number of concurrent executions handlers.     |
| batch        | integer  | Maximum number of messages per handler invocation.    |
| variables    | object   | Environment variables associated to the subscription. |
| logRetention | integer  | Log retention (in days) for the handler.              |
| memory       | integer  | Memory available (in megabytes) for the handler.      |

## Examples

- [Get started with queue](../../examples/hello-aws-queue)
- [Importing queue](../../examples/aws-import-queue)

## Providers

- [Local provider](../../providers/local/local-queue)
- [AWS provider](../../providers/aws/aws-queue)

## License

MIT License
