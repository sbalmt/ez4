# EZ4: Topic Requests

Topic requests define the **typed shape** of incoming messages processed by subscription handlers. The message type specified in the topic service is used to validate incoming requests before invoking handlers.

## Request declaration

The `Topic.Message` interface represents the full structure of an incoming topic message, ensuring that handlers operate on strongly typed, validated, and [reflection‑driven](../../../foundation/reflection/) request data.

#### Using class (preferred)

```ts
declare class MyMessage implements Topic.Message {
  foo: string;
  bar: number;
}
```

> The request class is always an implementation of the base `Topic.Message` interface.

#### Using interface

```ts
interface MyMessage extends Topic.Message {
  foo: string;
  bar: number;
}
```

> The request interface is always an extension of the base `Topic.Message` interface.

#### Using type

```ts
type MyMessage = {
  foo: string;
  bar: number;
};
```

> Less verbose, but no clear indication that the type is a strongly typed contract.

## Request fields

#### Trace Id

Unique identifier shared across services. It may come from the message attributes.

```ts
traceId: string;
```

#### Request Id

Unique identifier for the request.

```ts
requestId: string;
```

#### Message

Typed topic message payload.

```ts
message: MyMessage;
```

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
