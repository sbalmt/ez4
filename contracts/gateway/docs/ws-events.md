# EZ4: WebSocket Events

Gateway events for WebSocket define the **typed shape** of all connection signals processed by the gateway **connect** and **disconnect** route handler. Every handler receives a fully typed object, which includes identity information, headers, and query strings. These types are generated from the request contract and validated at runtime.

## Event declaration

The `Ws.Event` interface represents the full structure of an incoming WebSocket event, ensuring that handlers operate on strongly typed, validated, and [reflection‑driven](../../../foundation/reflection/) request data.

#### Using class (preferred)

```ts
declare class MyEvent implements Ws.Event {
  identity: object;
  headers: object;
  query: object;
}
```

> The request class is always an implementation of the base `Ws.Event` interface.

#### Using interface

```ts
interface MyEvent extends Ws.Event {
  identity: object;
  headers: object;
  query: object;
}
```

> The request interface is always an extension of the base `Ws.Event` interface.

## Event fields

#### Identity (optional)

Represents the authenticated identity returned by the **connect** route's authorizer.

- Populated only when an authorizer is defined.
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

#### Headers (optional)

Typed HTTP headers expected by the route.

- Only includes headers explicitly declared.
- Unknown headers are excluded unless declared.
- Automatically validated as strings.

```ts
headers: {
  'x-request-id': string;
  'x-api-version': string;
}
```

> Disconnect events do not receive new headers, they reuse the snapshot from connect.

#### Query Strings (optional)

Typed query string values.

- Only includes query strings explicitly declared.
- Unknown query strings are excluded unless declared.
- Automatically parsed into the declared types.

```ts
query: {
  token?: String.Base64;
}
```

> Query strings field names are affected by the `NamingStyle` preference.
> Disconnect handlers receive a copy of the same query values captured during connect.

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

- [WebSocket service](./ws-service.md)
- [WebSocket routes](./ws-routes.md)
- [WebSocket requests](./ws-requests.md)
- [WebSocket responses](./ws-responses.md)
- [Gateway handlers](./gateway-handler.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway listeners](./gateway-listener.md)
- [Gateway providers](./gateway-provider.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
