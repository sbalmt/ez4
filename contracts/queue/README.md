# EZ4: Queue

It uses the power of [reflection](../../foundation/reflection/) to provide a contract determines how to build and connect queue components.

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
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof eventHandler;
    }>
  ];

  services: {
    otherService: Environment.Service<OtherService>;
  };
}

// MyQueue message handler
export function eventHandler(request: Queue.Incoming<MyQueueMessage>, context: Service.Context<MyQueue>): void {
  const { otherService } = context;
  const { message } = request;

  // Access message contents
  // message.foo

  // Access injected services
  // otherService.call()
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

| Name          | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| fifoMode      | Enable and configure the FIFO mode options.                        |
| deadLetter    | Enable and configure the dead-letter queue options.                |
| subscriptions | All subscriptions associated to the queue.                         |
| delay         | Maximum delay (in seconds) to make messages available.             |
| polling       | Maximum wait time (in seconds) for receiving messages.             |
| retention     | Maximum retention time (in minutes) for all messages in the queue. |
| timeout       | Maximum acknowledge time (in seconds) for the handler.             |
| variables     | Environment variables associated to all subscription.              |
| services      | Injected services associated to all subscription.                  |

#### Subscriptions

| Name         | Description                                           |
| ------------ | ----------------------------------------------------- |
| listener     | Life-cycle listener function for the subscription.    |
| handler      | Entry point handler function for the subscription.    |
| concurrency  | Maximum number of concurrent executions handlers.     |
| batch        | Maximum number of messages per handler invocation.    |
| variables    | Environment variables associated to the subscription. |
| logRetention | Log retention (in days) for the handler.              |
| memory       | Memory available (in megabytes) for the handler.      |
| timeout      | Maximum execution time (in seconds) for the handler.  |

## Examples

- [Get started with queue](../../examples/hello-aws-queue)
- [Importing queue](../../examples/aws-import-queue)

## Providers

- [Local Provider](../../providers/local/local-queue)
- [AWS Provider](../../providers/aws/aws-queue)

## License

MIT License
