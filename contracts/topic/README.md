# EZ4: Topic

It uses the power of [reflection](../../foundation/reflection/) to provide a contract that determines how to build and connect topic components.

## Getting started

#### Install

```sh
npm install @ez4/topic @ez4/local-topic @ez4/aws-topic -D
```

#### Create topic

```ts
// file: topic.ts
import type { Service } from '@ez4/common';
import type { Topic } from '@ez4/topic';

// MyTopic message
type MyTopicMessage = {
  foo: string;
  bar: number;
};

// MyTopic declaration
export declare class MyTopic extends Topic.Service<MyTopicMessage> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof eventHandler;
    }>
  ];

  services: {
    otherService: Environment.Service<OtherService>;
  };
}

// MyTopic message handler
export function eventHandler(request: Topic.Incoming<MyTopicMessage>, context: Service.Context<MyTopic>): void {
  const { otherService } = context;
  const { message } = request;

  // Access message contents
  // message.foo

  // Access injected services
  // otherService.call()
}
```

#### Use topic

```ts
// file: handler.ts
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

## Topic properties

| Name          | Description                                           |
| ------------- | ----------------------------------------------------- |
| fifoMode      | Enable and configure the FIFO mode options.           |
| subscriptions | All subscriptions associated to the topic.            |
| variables     | Environment variables associated to all subscription. |
| services      | Injected services associated to all subscription.     |

#### Function subscriptions

| Name         | Description                                           |
| ------------ | ----------------------------------------------------- |
| listener     | Life-cycle listener function for the subscription.    |
| handler      | Entry-point handler function for the subscription.    |
| variables    | Environment variables associated to the subscription. |
| logRetention | Log retention (in days) for the handler.              |
| memory       | Memory available (in megabytes) for the handler.      |
| timeout      | Maximum execution time (in seconds) for the handler.  |

#### Queue subscriptions

| Name    | Description                     |
| ------- | ------------------------------- |
| service | Reference to the queue service. |

## Examples

- [Get started with topic](../../examples/hello-aws-topic)
- [Importing topic](../../examples/aws-import-topic)

## Providers

- [Local provider](../../providers/local/local-topic)
- [AWS provider](../../providers/aws/aws-topic)

## License

MIT License
