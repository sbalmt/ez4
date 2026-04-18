# EZ4: WebSocket Requests

Gateway requests for WebSocket define the **typed shape** of all incoming WS data processed by the gateway **message** route handler (connect and disconnect handlers don't produce responses). The handler receives a fully typed object, which includes identity information and body payloads. These types are generated from the request contract and validated at runtime.

## Request declaration

The `Ws.Request` interface represents the full structure of an incoming WebSocket request, ensuring that handlers operate on strongly typed, validated, and [reflection‑driven](../../../foundation/reflection/) request data.

#### Using class (preferred)

```ts
declare class MyRequest implements Ws.Request {
  identity: object;
  body: object | string;
}
```

> The request class is always an implementation of the base `Ws.Request` interface.

#### Using interface

```ts
interface MyRequest extends Ws.Request {
  identity: object;
  body: object | string;
}
```

> The request interface is always an extension of the base `Ws.Request` interface.

## Request fields

#### Identity (optional)

Represents the authenticated identity established during the **connect** route.

- Populated only when the connect route defines an authorizer.
- Useful for access control, multi‑tenant logic, and auditing.
- Contains authentication and authorization context.

```ts
identity: {
  userId: String.UUID;
  roles: string[];
  // ...
}
```

> If no authorizer is configured, identity is `undefined`.

#### Body (optional)

Typed request body payload.

- Automatically parsed into the declared types.
- Supports JSON objects and raw string payloads.
- Shape is determined by the declared contract.

JSON payload (preferred):

```ts
body: {
  action: ActionEnum;
  value: String.Size<1, 250>;
  limit?: Integer.Any;
}
```

> Body field names are affected by the `NamingStyle` preference.

Raw String payload:

```ts
body: string;
```

> Raw string body is useful for non-JSON formats.

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

- [WebSocket routes](./ws-routes.md)
- [WebSocket responses](./ws-responses.md)
- [Gateway handlers](./gateway-handler.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway listeners](./gateway-listener.md)
- [Gateway providers](./gateway-provider.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
