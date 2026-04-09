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

// MyTopic message
type MyTopicMessage = {
  foo: string;
  bar: number;
};

// MyTopic declaration
export declare class MyTopic extends Topic.Unordered<MyTopicMessage> {
  subscriptions: [
    Topic.UseSubscription<{
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

#### Handle events

EZ4 validates the incoming event, injects all variables and services, and then invokes your subscription handler.

```ts
// MyTopic message handler
export function eventHandler(request: Topic.Incoming<MyTopicMessage>, context: Service.Context<MyTopic>): void {
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
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myTopic } = context;

  await myTopic.sendMessage({
    foo: 'foo',
    bar: 123
  });
}
```

> This makes it easy to trigger event‑driven workflows from anywhere in your application.

With your topic defined, EZ4 handles provisioning, event routing, retries, and execution according to your contract.

## Topic properties

#### Service

| Name          | Type                    | Description                                              |
| ------------- | ----------------------- | -------------------------------------------------------- |
| fifoMode      | Topic.UseFifoMode<>     | Enable and configure the FIFO mode options.              |
| subscriptions | Topic.UseSubscription<> | All subscriptions associated to the topic.               |
| variables     | object                  | Environment variables associated with all subscriptions. |
| services      | object                  | Injected services associated with all subscriptions.     |

> Use type helpers for `fifoMode` and `subscriptions` properties.

#### Subscriptions (Function)

| Name         | Type             | Description                                                 |
| ------------ | ---------------- | ----------------------------------------------------------- |
| listener     | function         | Life-cycle listener function for the subscription.          |
| handler      | function         | Entry-point handler function for the subscription.          |
| variables    | object           | Environment variables associated to the subscription.       |
| logRetention | integer          | Log retention (in days) for the handler.                    |
| logLevel     | LogLevel         | Log level for the handler.                                  |
| architecture | ArchitectureType | Architecture type for the cloud function.                   |
| runtime      | RuntimeType      | Runtime for the cloud function.                             |
| files        | string[]         | Additional resource files added into the handler bundle.    |
| timeout      | integer          | Maximum execution time (in seconds) for the handler.        |
| memory       | integer          | Memory available (in megabytes) for the handler.            |
| debug        | boolean          | Determine whether the debug mode is active for the handler. |
| vpc          | boolean          | Determines whether or not VPC is enabled for the handler.   |

#### Subscriptions (Queue)

| Name    | Type                  | Description                     |
| ------- | --------------------- | ------------------------------- |
| service | Environment.Service<> | Reference to the queue service. |

## Examples

- [Get started with topic](../../examples/hello-aws-topic)
- [Importing topic](../../examples/aws-import-topic)

## Providers

- [Local provider](../../providers/local/local-topic)
- [AWS provider](../../providers/aws/aws-topic)

## License

MIT License
