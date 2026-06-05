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

// My message declaration
declare class MyMessage implements Queue.Message {
  foo: string;
  bar: number;
}

// My queue declaration
export declare class MyQueue extends Queue.Unordered<MyMessage> {
  retention: 600;

  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof processMessage;
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
// My message handler
export function processMessage(request: Queue.Incoming<MyMessage>, context: Service.Context<MyQueue>): void {
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
export async function anotherHandler(_request: any, context: Service.Context<AnotherService>) {
  const { myQueue } = context;

  await myQueue.sendMessage({
    foo: 'foo',
    bar: 123
  });
}
```

> This makes it easy to trigger background work from any part of your application.

With your queue defined, EZ4 handles provisioning, message routing, retries, and execution according to your contract.

## What's next

- [Queue service](./docs/queue-service.md)
- [Queue subscriptions](./docs/queue-subscriptions.md)
- [Queue requests](./docs/queue-requests.md)
- [Queue handler](./docs/queue-handler.md)
- [Queue listener](./docs/queue-listener.md)

## Examples

- [Get started with queue](../../examples/hello-aws-queue)
- [Importing queue](../../examples/aws-import-queue)

## Providers

- [Local provider](../../providers/local/local-queue)
- [AWS provider](../../providers/aws/aws-queue)

## License

MIT License
