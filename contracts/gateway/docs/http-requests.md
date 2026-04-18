# EZ4: HTTP Requests

Gateway requests define the **typed shape** of all incoming HTTP data processed by a gateway route. Every handler receives a fully typed object, which includes identity information, headers, path parameters, query strings, and body payloads. These types are generated from the request contract and validated at runtime.

## Request declaration

The `Http.Request` interface represents the full structure of an incoming HTTP request, ensuring that handlers operate on strongly typed, validated, and [reflection‑driven](../../../foundation/reflection/) request data.

#### Using class (preferred)

```ts
declare class MyRequest implements Http.Request {
  identity: object;
  headers: object;
  parameters: object;
  query: object;
  body: object | string;
}
```

> The request class is always an implementation of the base `Http.Request` interface.

#### Using interface

```ts
interface MyRequest extends Http.Request {
  identity: object;
  headers: object;
  parameters: object;
  query: object;
  body: object | string;
}
```

> The request interface is always an extension of the base `Http.Request` interface.

## Request fields

#### Identity (optional)

Represents the authenticated identity returned by the route's authorizer.

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

#### Path Parameters (optional)

Typed path parameters extracted from the route's URL pattern.

- Must match the `{}` segments in the route path.
- Automatically validated as strings.

```ts
parameters: {
  id: String.UUID;
  group: string;
}
```

> Path parameters are guaranteed to exist when declared.

#### Query Strings (optional)

Typed query string values.

- Only includes query strings explicitly declared.
- Unknown query strings are excluded unless declared.
- Automatically parsed into the declared types.

```ts
query: {
  search?: String.Max<250>;
  limit: Integer.Any;
  tags: TagsEnum[];
}
```

> Query strings field names are affected by the `NamingStyle` preference.

#### Body (optional)

Typed request body payload.

- Automatically parsed into the declared types.
- Supports JSON objects and raw string payloads.
- Shape is determined by the declared contract.

JSON payload (preferred):

```ts
body: {
  name: String.Size<1, 20>;
  email: String.Email;
  age?: Integer.Any;
}
```

> Body is `undefined` for routes without a body (e.g., GET requests). It's field names are affected by the `NamingStyle` preference.

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

- [Declare routes](./http-routes.md)
- [Declare responses](./http-responses.md)
- [Declare handlers](./gateway-handler.md)
- [Declare authorizers](./gateway-authorizer.md)
- [Declare listeners](./gateway-listener.md)
- [Declare providers](./gateway-provider.md)
- [Declare defaults](./gateway-defaults.md)

## License

MIT License
