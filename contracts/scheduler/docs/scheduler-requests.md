# EZ4: Scheduler Requests

Scheduler requests define the **typed payload** available to handlers and listeners when a scheduled event executes. The scheduler event payload is validated and transformed before your handler runs.

## Event declaration

Declare the scheduler event type that describes the shape of the payload.

#### Using class (preferred)

```ts
declare class MyEvent implements Cron.Event {
  foo: string;
  bar: number;
}
```

> The event class is always an implementation of the base `Cron.Event` interface.

#### Using interface

```ts
interface MyEvent extends Cron.Event {
  foo: string;
  bar: number;
}
```

> The event interface is always an extension of the base `Cron.Event` interface.

#### Using type

```ts
type MyEvent = Cron.Event & {
  foo: string;
  bar: number;
};
```

> Less verbose, but using a class or interface makes the scheduler contract more explicit.

## Contract schema

Request validation and transformation are powered by the rich schema system provided by the [@ez4/schema](../../../foundation/schema/) package. Schemas define the structure, validation rules, and transformations applied before the handler receives the request.

Learn more about schemas:

- [Object schema](../../../foundation/schema/docs/object-schema.md)
- [Array schema](../../../foundation/schema/docs/array-schema.md)
- [String schema](../../../foundation/schema/docs/string-schema.md)
- [Decimal schema](../../../foundation/schema/docs/decimal-schema.md)
- [Integer schema](../../../foundation/schema/docs/integer-schema.md)
- [Boolean schema](../../../foundation/schema/docs/boolean-schema.md)
- [Enum schema](../../../foundation/schema/docs/enum-schema.md)

## What's next

- [Scheduler service](./scheduler-service.md)
- [Scheduler target](./scheduler-target.md)
- [Scheduler listener](./scheduler-listener.md)
- [Scheduler client](./scheduler-client.md)

## License

MIT License
