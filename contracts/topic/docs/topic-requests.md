# EZ4: Topic Requests

Topic requests define the **typed shape** of incoming events processed by subscription handlers. The event type specified in the topic service is used to validate incoming requests before invoking handlers.

## Request declaration

The `Topic.Event` interface represents the full structure of an incoming topic event, ensuring that handlers operate on strongly typed, validated, and [reflection‑driven](../../../foundation/reflection/) request data.

#### Using class (preferred)

```ts
declare class MyEvent implements Topic.Event {
  foo: string;
  bar: number;
}
```

> The request class is always an implementation of the base `Topic.Event` interface.

#### Using interface

```ts
interface MyEvent extends Topic.Event {
  foo: string;
  bar: number;
}
```

> The request interface is always an extension of the base `Topic.Event` interface.

#### Using type

```ts
type MyEvent = {
  foo: string;
  bar: number;
};
```

> Less verbose, but no clear indication that the type is a strongly typed contract.

## Contract schema

Request validation and transformation are powered by the rich schema system provided by the [@ez4/schema](../../../foundation/schema/) package. Schemas define the structure, validation rules, and transformations applied before the request reaches your handler.

Learn more about schemas:

- [Object schema](../../../foundation/schema/docs/object-schema.md)
- [Array schema](../../../foundation/schema/docs/array-schema.md)
- [String schema](../../../foundation/schema/docs/string-schema.md)
- [Decimal schema](../../../foundation/schema/docs/decimal-schema.md)
- [Integer schema](../../../foundation/schema/docs/integer-schema.md)
- [Boolean schema](../../../foundation/schema/docs/boolean-schema.md)
- [Enum schema](../../../foundation/schema/docs/enum-schema.md)

## What's next

- [Topic service](./topic-service.md)
- [Topic subscriptions](./topic-subscriptions.md)
- [Topic handlers](./topic-handler.md)
- [Topic listeners](./topic-listener.md)
- [Topic client](./topic-client.md)

## License

MIT License
