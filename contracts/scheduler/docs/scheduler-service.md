# EZ4: Scheduler Service

A scheduler service defines the **time-based or programmatic scheduling interface** of an application. It bundles together event schema, target configuration, shared variables, injected services, and the generated scheduler client. A `Cron.Service` is the top-level contract that EZ4 uses to generate infrastructure, type-safe clients, and runtime bindings for scheduled tasks.

## Service declaration

A scheduler service is declared by extending `Cron.Service<T>` and providing a target using `Cron.UseTarget`.

#### Recurring scheduler

```ts
export declare class MyScheduler extends Cron.Service {
  expression: 'cron(0/15 * * * ? *)';

  target: Cron.UseTarget<{
    handler: typeof eventHandler;
  }>;
}
```

> Best for recurring cron jobs use case.

#### Programmatic scheduler

```ts
declare class MyEvent implements Cron.Event {
  bar: boolean;
  foo: number;
}

export declare class MyScheduler extends Cron.Service<MyEvent> {
  expression: 'dynamic';

  target: Cron.UseTarget<{
    handler: typeof eventHandler;
  }>;
}
```

> Best for dynamic schedules use case.

## Service fields

The following fields define the behavior, scheduling policy, and runtime environment of a scheduler service.

#### Target

Defines the entry-point handler and optional listener for the scheduler.

- The target controls execution options such as runtime, memory, timeouts, and logging.
- A scheduler service must declare exactly one target.

```ts
target: Cron.UseTarget<{
  handler: typeof eventHandler;
  listener: typeof schedulerListener;
  timeout: 30;
}>;
```

> Use `typeof` because the handler is referenced by type. See the scheduler [target](./scheduler-target.md) for more details.

#### Expression

Defines the schedule expression or literal `'dynamic'`.

- Use `'dynamic'` to create events programmatically via the scheduler client.
- Use cron-style values for fixed schedules.

```ts
expression: 'cron(0 0 * * ? *)';
```

> Dynamic schedulers are useful for delayed execution and custom scheduling workflows.

#### Group (optional)

Defines a scheduler group name.

- Groups help organize related scheduled tasks.
- Use consistent naming for schedulers that belong to the same workflow.

```ts
group: 'billing';
```

#### Timezone (optional)

Specifies the timezone used by the schedule expression.

```ts
timezone: 'America/New_York';
```

#### Start date (optional)

Controls the start of the active window for the scheduler.

```ts
startDate: '2026-01-01T00:00:00Z';
```

#### End date (optional)

Controls the end of the active window for the scheduler.

```ts
endDate: '2026-12-31T23:59:59Z';
```

#### Max retries (optional)

Limits the number of retry attempts for failed event executions.

```ts
maxRetries: 3;
```

#### Max age (optional)

Specifies how long (in seconds) an event remains eligible for retries.

```ts
maxAge: 3600;
```

#### Disabled (optional)

Determines whether the scheduler is disabled.

```ts
disabled: true;
```

#### Variables (optional)

Declares environment variables available to the scheduler target.

- Supports both mapped variables and literal values.
- Scheduler service variables should **not** be accessed via `process.env`.
- Accessible through `Environment.ServiceVariables` in the handler context.

```ts
variables: {
  variableA: Environment.Variable<'ENV_VAR_NAME'>;
  variableB: 'literal value';
}
```

#### Services (optional)

Declares injected services available to the scheduler target.

- Each entry is a service binding injected into the runtime context.
- Useful for exposing shared infrastructure or internal application services.

```ts
services: {
  database: Environment.Service<Database>;
  variables: Environment.ServiceVariables;
}
```

## What's next

- [Scheduler target](./scheduler-target.md)
- [Scheduler requests](./scheduler-requests.md)
- [Scheduler listener](./scheduler-listener.md)
- [Scheduler client](./scheduler-client.md)

## License

MIT License
