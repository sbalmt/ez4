# EZ4: Topic

The Topic contract defines a publish/subscribe event stream for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your message type, subscriptions, variables, and connected services, then generates the infrastructure and runtime bindings required to deliver and process events.

## Getting started

#### Install

```sh
npm install @ez4/topic @ez4/local-topic @ez4/aws-topic -D
```

#### Create a topic

Topics are ideal for fan‑out messaging, event‑driven workflows, and loosely coupled communication between services.

```ts
import type { Environment, Service } from '@ez4/common';
import type { Topic } from '@ez4/topic';

// My message declaration
declare class MyMessage implements Topic.Message {
  foo: string;
  bar: number;
}

// My topic declaration
export declare class MyTopic extends Topic.Unordered<MyMessage> {
  subscriptions: [
    Topic.UseSubscription<{
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

#### Handle events

EZ4 validates the incoming event, injects all variables and services, and then invokes your subscription handler.

```ts
// My message handler
export function processMessage(request: Topic.Incoming<MyMessage>, context: Service.Context<MyTopic>): void {
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

#### Publish events

Any handler with access to the topic service can publish events.

```ts
import type { Service } from '@ez4/common';
import type { MyTopic } from './topic';

// Any other handler that has injected MyTopic service
export async function anotherHandler(_request: any, context: Service.Context<AnotherService>) {
  const { myTopic } = context;

  await myTopic.sendMessage({
    foo: 'foo',
    bar: 123
  });
}
```

> This makes it easy to trigger event‑driven workflows from anywhere in your application.

With your topic defined, EZ4 handles provisioning, event routing, retries, and execution according to your contract.

## What's next

- [Topic service](./docs/topic-service.md)
- [Topic subscriptions](./docs/topic-subscriptions.md)
- [Topic requests](./docs/topic-requests.md)
- [Topic handler](./docs/topic-handler.md)
- [Topic listener](./docs/topic-listener.md)
- [Topic client](./docs/topic-client.md)

## Examples

- [Get started with topic](../../examples/hello-aws-topic)
- [Importing topic](../../examples/aws-import-topic)

## Providers

- [Local provider](../../providers/local/local-topic)
- [AWS provider](../../providers/aws/aws-topic)

## License

MIT License
