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

// My event declaration
type MyEvent = {
  foo: string;
  bar: number;
};

// My scheduler declaration
export declare class MyScheduler extends Cron.Service<MyEvent> {
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
// My event handler
export function eventHandler(request: Cron.Incoming<MyEvent>, context: Service.Context<MyScheduler>): void {
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
export async function anotherHandler(_request: any, context: Service.Context<AnotherService>) {
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

## What's next

- [Scheduler service](./docs/scheduler-service.md)
- [Scheduler target](./docs/scheduler-target.md)
- [Scheduler requests](./docs/scheduler-requests.md)
- [Scheduler listener](./docs/scheduler-listener.md)
- [Scheduler client](./docs/scheduler-client.md)

## Examples

- [Get started with scheduler](../../examples/hello-aws-scheduler)
- [Schedule manager](../../examples/aws-schedule-manager)

## Providers

- [Local provider](../../providers/local/local-scheduler)
- [AWS provider](../../providers/aws/aws-scheduler)

## License

MIT License
