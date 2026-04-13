# EZ4: Gateway Responses

Gateway responses define the **typed shape** of all outgoing HTTP responses produced by a gateway handler. Every handler returns a fully typed object that includes the HTTP status code, optional headers, and an optional body payload. These types are generated from the response contract and validated at runtime.

## Response declaration

The `Http.Response` interface represents the full structure of an outgoing HTTP response, ensuring that handlers return strongly typed, and [reflection‑driven](../../../foundation/reflection/) response data.

#### Using class (preferred)

```ts
declare class MyResponse implements Http.Response {
  status: 200; // 2XX
  headers: {
    // Required headers ...
  };
  body: object | string | number | boolean;
}
```

> The response class is always an implementation of the base `Http.Response` interface.

#### Using interface

```ts
interface MyResponse extends Http.Response {
  status: 200; // 2XX
  headers: {
    // Required headers ....
  };
  body: object | string | number | boolean;
}
```

> The response interface is always an extension of the base `Http.Response` interface.

## Response fields

#### Status

The HTTP status code returned by the handler.

- Determines how the gateway formats the final response.
- Must be a valid HTTP status code (e.g., 200, 201, 204).

```ts
status: 200 | 201;
```

> Status codes for errors are inferred from the `httpErrors` mapping, and thrown `HttpError` exceptions.

#### Headers (optional)

Typed HTTP headers returned by the handler.

- Only includes headers explicitly declared in the response contract.
- Unknown headers are excluded unless declared.

```ts
headers: {
  'x-custom-value': string;
}
```

> For JSON responses, the content type header is automatically defined.

#### Body (optional)

Typed HTTP response body.

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

> Body is optional for responses such as `204 No Content`. It's field names are affected by the `NamingStyle` preference.

Scalar payload:

```ts
body: string | number | boolean;
```

> Scalar response bodies must be explicitly declared and are useful for non‑JSON formats.

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

- [Declare routes](./http-routes.md)
- [Declare requests](./http-requests.md)
- [Declare handlers](./gateway-handler.md)
- [Declare authorizers](./gateway-authorizer.md)
- [Declare listeners](./gateway-listener.md)
- [Declare providers](./gateway-provider.md)
- [Declare defaults](./gateway-defaults.md)

## License

MIT License
