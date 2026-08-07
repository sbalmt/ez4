# EZ4: Topic

The Topic contract defines a publish/subscribe event stream for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your event type, subscriptions, variables, and connected services, then generates the infrastructure and runtime bindings required to deliver and process events.

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

// My event declaration
declare class MyEvent implements Topic.Event {
  foo: string;
  bar: number;
}

// My topic declaration
export declare class MyTopic extends Topic.Unordered<MyEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof processEvent;
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
// My event handler
export function processEvent(request: Topic.Incoming<MyEvent>, { otherService, variables }: Service.Context<MyTopic>): void {
  const { event } = request;

  // Access event contents
  event.foo;

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
export async function anotherHandler(_request: any, { myTopic }: Service.Context<AnotherService>) {
  await myTopic.publishEvent({
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
