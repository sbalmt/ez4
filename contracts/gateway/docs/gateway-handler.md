# EZ4: Gateway Handler

Gateway handlers define the **business logic** executed when a route is invoked. A handler receives a fully typed request object, a provider context, and returns a typed response object. Handlers run inside an isolated cloud resource and represent the core execution unit of an HTTP or WebSocket gateway.

## HTTP implementation

```ts
export function myHandler(request: Http.Incoming<MyRequest>, context: Service.Context<MyServer>): MyResponse {
  // Business logic here.

  return {
    status: 200,
    body: {
      message: 'Hello HTTP Gateway'
    }
  };
}
```

> For better context isolation and shared configuration, use gateway [providers](./gateway-provider.md).

#### HTTP Request fields

Handlers receive a typed request object generated from the route contract.
Depending on the route definition, the request may include:

- **Identity** - Identity returned by the authorizer.
- **Headers** - Typed HTTP headers.
- **Parameters** - Typed path parameters.
- **Query** - Typed query strings.
- **Body** - Typed JSON or raw string payload.

All fields are validated and transformed according to the declared contract, as mentioned in the HTTP [requests](./http-requests.md) documentation.

#### HTTP Response fields

Handlers must return a typed response object that matches the route's response contract.

- **Status** - Required HTTP status code.
- **Headers** - Optional typed headers.
- **Body** - Optional JSON or scalar (string, number, or boolean) payload.

Unknown fields are automatically removed, as per the HTTP [responses](./http-responses.md) documentation.

#### HTTP Error handling

Exceptions are automatically captured:

- `HttpError` includes its own status code.
- Exceptions mapped in `httpErrors` use the mapped status code.
- All other errors become internal server errors.

## WS implementation

WebSocket services have two types of handlers.

#### Message handler

Used for **message** requests.

```ts
export function myHandler(request: Ws.Incoming<MyMessage>, context: Service.Context<MyServer>): MyResponse {
  // Business logic here.

  return {
    body: {
      message: 'Hello WS Gateway'
    }
  };
}
```

> Message handlers use the gateway service contract itself as the context provider.

#### Connection handlers

Used for **connect** and **disconnect** events.

```ts
export function connectionHandler(request: Ws.Incoming<MyEvent>, context: Service.Context<MyServer>) {
  // Business logic here.
}
```

> Connection handlers use the gateway service contract itself as the context provider.

#### WS Request fields (message handlers)

Handlers receive a typed object generated from the request contract.
Depending on the contract definition, the request may include:

- **Identity** - Identity returned by the connect authorizer.
- **Body** - Typed JSON or raw string payload.

All fields are validated and transformed according to the request contract, as mentioned in the WS [requests](./ws-requests.md) documentation.

#### WS Response fields (message handlers)

Handlers must return a typed response object that matches the response contract.

- **Body** - Optional JSON or raw string payload.

WebSocket responses do not include status codes or headers; Unknown fields are automatically removed, as per the WS [responses](./ws-responses.md) documentation.

#### WS Event fields (connect and disconnect handlers)

Handlers receive a typed object generated from the event contract.
Depending on the contract definition, the event may include:

- **Identity** - Identity returned by the connect authorizer.
- **Headers** - Typed HTTP headers captured during connect (copied to disconnect).
- **Query** - Typed query strings captured during connect (copied to disconnect).

All fields are validated and transformed according to the event contract, as mentioned in the WS [events](./ws-events.md) documentation.

#### WS Error handling

Exceptions are automatically captured:

- Errors thrown in the **connect** handler prevent the connection from being established.
- Errors thrown in the **message** handler are formatted and sent back through the connection.
- Errors in the **disconnect** handler are logged only, since the connection is already closed.

## What's next

- [HTTP routes](./http-routes.md)
- [WebSocket routes](./ws-routes.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway listeners](./gateway-listener.md)
- [Gateway providers](./gateway-provider.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
