# EZ4: Scheduler

It uses the power of [reflection](../../foundation/reflection/) to provide a contract that determines how to build and connect scheduler components.

## Getting started

#### Install

```sh
npm install @ez4/scheduler @ez4/local-scheduler @ez4/aws-scheduler -D
```

#### Create dynamic cron

```ts
// file: cron.ts
import type { Environment, Service } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';

// MyScheduler event
type MySchedulerEvent = {
  foo: string;
  bar: number;
};

// MyScheduler declaration
export declare class MyScheduler extends Cron.Service<MySchedulerEvent> {
  expression: 'dynamic';

  target: Cron.UseTarget<{
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

// MyScheduler event handler
export function eventHandler(request: Cron.Incoming<MySchedulerEvent>, context: Service.Context<MyScheduler>): void {
  const { otherService, variables } = context;
  const { event } = request;

  // Access event contents
  event.foo;

  // Access injected services
  otherService.call();

  // Access injected variables
  variables.myVariable;
}
```

#### Use dynamic cron

```ts
// file: handler.ts
import type { Service } from '@ez4/common';
import type { MyScheduler } from './cron';

// Any other handler that has injected MyScheduler service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myScheduler } = context;

  // Schedule a future execution
  await myScheduler.createEvent('scheduler-id', {
    date: new Date(Date.now() + 60 * 1000),
    event: {
      foo: 'foo',
      bar: 123
    }
  });
}
```

## Scheduler properties

#### Service

| Name       | Type             | Description                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------- |
| target     | Cron.UseTarget<> | Entry-point handler for scheduler events.                                 |
| group      | string           | Scheduler group name.                                                     |
| timezone   | string           | Scheduler expression timezone.                                            |
| startDate  | string           | An ISO date to determine when the scheduler should start to work.         |
| endDate    | string           | An ISO date to determine when the scheduler should stop to work.          |
| maxRetries | integer          | Maximum retry attempts for the event before it fails.                     |
| maxAge     | integer          | Maximum age (in seconds) for the event to be eligible for retry attempts. |
| expression | string           | Scheduler expression or literal 'dynamic'.                                |
| disabled   | boolean          | Determines whether or not the scheduler is disabled.                      |
| variables  | object           | Environment variables associated to the event handler.                    |
| services   | object           | Injected services associated to handler function.                         |

> Use type helpers for `target` property.

#### Target

| Name         | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| listener     | function | Life-cycle listener function for the target.         |
| handler      | function | Entry-point handler function for the target.         |
| variables    | object   | Environment variables associated to handler.         |
| logRetention | integer  | Log retention (in days) for the handler.             |
| timeout      | integer  | Maximum execution time (in seconds) for the handler. |
| memory       | integer  | Memory available (in megabytes) for the handler.     |

## Examples

- [Get started with scheduler](../../examples/hello-aws-scheduler)
- [Schedule manager](../../examples/aws-schedule-manager)

## Providers

- [Local provider](../../providers/local/local-scheduler)
- [AWS provider](../../providers/aws/aws-scheduler)

## License

MIT License
