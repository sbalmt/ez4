# EZ4: Scheduler

The Scheduler contract defines time‑based or programmatically scheduled events for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your event type, target handler, variables, and connected services, then generates the infrastructure and runtime bindings required to execute scheduled tasks.

## Getting started

#### Install

```sh
npm install @ez4/scheduler @ez4/local-scheduler @ez4/aws-scheduler -D
```

#### Create a dynamic scheduler

Schedulers are ideal for cron jobs, recurring tasks, delayed execution, and dynamic scheduling workflows.

```ts
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
```

#### Handle scheduled events

EZ4 validates the incoming event, injects all variables and services, and then invokes your target handler.

```ts
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

#### Use dynamic scheduler

Dynamic schedulers allow you to create scheduled events programmatically.

```ts
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

> This makes it easy to schedule delayed or recurring tasks from anywhere in your application.

With your scheduler defined, EZ4 handles provisioning, event triggering, retries, and execution automatically according to your contract.

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
| variables  | object           | Environment variables associated with the event handler.                  |
| services   | object           | Injected services associated with handler function.                       |

> Use type helpers for `target` property.

#### Target

| Name         | Type             | Description                                                 |
| ------------ | ---------------- | ----------------------------------------------------------- |
| listener     | function         | Life-cycle listener function for the target.                |
| handler      | function         | Entry-point handler function for the target.                |
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

- [Get started with scheduler](../../examples/hello-aws-scheduler)
- [Schedule manager](../../examples/aws-schedule-manager)

## Providers

- [Local provider](../../providers/local/local-scheduler)
- [AWS provider](../../providers/aws/aws-scheduler)

## License

MIT License
