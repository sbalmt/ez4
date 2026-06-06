# EZ4: Queue Requests

Queue requests define the **typed shape** of incoming messages processed by subscription handlers. The message type declared by the queue service is used to validate incoming requests before invoking handlers.

## Request declaration

The `Queue.Message` interface represents the full structure of an incoming message request, ensuring that handlers operate on strongly typed, validated, and [reflection‑driven](../../../foundation/reflection/) request data.

#### Using class (preferred)

```ts
declare class MyMessage implements Queue.Message {
  foo: string;
  bar: number;
}
```

> The request class is always an implementation of the base `Queue.Message` interface.

#### Using interface

```ts
interface MyRequest extends Queue.Message {
  foo: string;
  bar: number;
}
```

> The request interface is always an extension of the base `Queue.Message` interface.

#### Using type

```ts
type MyRequest = {
  foo: string;
  bar: number;
};
```

> Less verbose, but no clear indication that the type is a strong typed contract.

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

- [Queue service](./queue-service.md)
- [Queue subscriptions](./queue-subscriptions.md)
- [Queue handler](./queue-handler.md)
- [Queue listener](./queue-listener.md)
- [Queue client](./queue-client.md)

## License

MIT License
