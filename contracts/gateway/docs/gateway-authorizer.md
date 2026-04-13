# EZ4: Gateway Authorizer

Gateway authorizers define the **authentication and authorization logic** executed before a handler is invoked. Authorizers run in an isolated cloud resource, receive a typed request object, and return an identity object that becomes available to the downstream handler. If the authorizer fails or returns no identity, the request is rejected before reaching the handler.

## Authorizer request

The `Http.AuthRequest` or `Ws.AuthRequest` interface defines the typed shape of the request received by an authorizer. It contains only the fields relevant for authentication and authorization.

```ts
declare class AuthorizerRequest implements Http.AuthRequest {
  headers: {
    // Required headers ...
  };

  parameters: {
    // Required path parameters ...
  };

  query: {
    // Required query strings ...
  };
}
```

> Use `Ws.AuthRequest` for WebSocket authorizers.

#### Request fields

- **Headers** - Typed HTTP headers used for tokens, API keys, signatures, or metadata.
- **Parameters** - Typed path parameters, useful for resource‑level authorization (e.g., `/users/{id}`).
- **Query** - Typed query strings, often used for signed URLs, expiration tokens, or filters.

All fields are validated and transformed according to the declared contract, , as mentioned in the HTTP [requests](./http-requests.md) documentation.

## Authorizer response

The `Http.AuthResponse` or `Ws.AuthResponse` interface defines the identity returned by the authorizer. This identity becomes available to the handler as `request.identity`.

```ts
declare class AuthorizerResponse implements Http.AuthResponse {
  identity?: {
    // Identity data.
  };
}
```

> Use `Ws.AuthResponse` for WebSocket authorizers.

#### Response fields

The **identity** object may include:

- User identifiers along with its roles and permissions.
- Any custom metadata needed by the handler.
- Tenant or organization context.

All fields are validated according to the declared contract.

## Authorizer implementation

An authorizer is a function that receives a typed authorization request and returns an authorization response.

```ts
export function authorizerHandler(
  request: Http.Incoming<AuthorizerRequest>,
  context: Service.Context<AuthorizerProvider>
): AuthorizerResponse {
  // Validate token, check permissions, etc.

  return {
    identity: {
      userId: '00000000-0000-1000-9000-000000000000',
      roles: [RolesEnum.Admin],
      tenantId: 1000
    }
  };
}
```

> Throwing an exception or returning no identity denies the request. Use `Ws.Incoming` for WebSocket requests.

## What's next

- [Declare routes](./http-routes.md)
- [Declare requests](./http-requests.md)
- [Declare responses](./http-responses.md)
- [Declare handlers](./gateway-handler.md)
- [Declare listeners](./gateway-listener.md)
- [Declare providers](./gateway-provider.md)
- [Declare defaults](./gateway-defaults.md)

## License

MIT License
