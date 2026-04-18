# EZ4: WebSocket Responses

Gateway responses for WebSocket define the **typed shape** of all outgoing WS data produced by the gateway **message** route handler (connect and disconnect handlers don't produce responses). The handler returns a fully typed object that includes an optional body payload. These types are generated from the response contract and validated at runtime.

## Response declaration

The `Ws.Response` interface represents the full structure of an outgoing WS response, ensuring that handlers return strongly typed, and [reflection‑driven](../../../foundation/reflection/) response data.

#### Using class (preferred)

```ts
declare class MyResponse implements Ws.Response {
  body: object | string;
}
```

> The response class is always an implementation of the base `Ws.Response` interface.

#### Using interface

```ts
interface MyResponse extends Ws.Response {
  body: object | string;
}
```

> The response interface is always an extension of the base `Ws.Response` interface.

## Response fields

#### Body (optional)

Typed message response body.

- Automatically removes fields not matching the contract.
- Shape is determined by the declared contract.
- Supports JSON objects and scalar payloads.

JSON payload (preferred):

```ts
body: {
  id: String.UUID;
  email: String.Email;
  name: string;
}
```

> Body field names are affected by the `NamingStyle` preference.

Raw payload:

```ts
body: string;
```

> Raw response bodies must be explicitly declared and are useful for non‑JSON formats.

## Contract schema

Responses are not validated or transformed in the same way requests are. Instead, EZ4 uses the rich schema system provided by the [@ez4/schema](../../../foundation/schema/) package to enrich OpenAPI documentation and strip any fields that do not match the declared response shape.

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
- [WebSocket requests](./ws-requests.md)
- [Gateway handlers](./gateway-handler.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway listeners](./gateway-listener.md)
- [Gateway providers](./gateway-provider.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
