# EZ4: Gateway Handler

Gateway handlers define the **business logic** executed when a route is invoked. A handler receives a fully typed request object, a provider context, and returns a typed response object. Handlers run inside an isolated cloud resource and represent the core execution unit of an HTTP or WebSocket gateway.

## HTTP implementation

Use `Http.Incoming<T>` for validated route input and return a response matching the route declaration.

```ts
export function myHandler(request: Http.Incoming<MyRequest>, { myClient, myVariables }: Service.Context<MyProvider>): MyResponse {
  // Access only the linked context services declared here.
  myClient.doSomething();
  myVariables.myVariable;

  return {
    status: 200,
    body: {
      message: 'Hello HTTP Gateway'
    }
  };
}
```

> Parameter destructuring is recommended because EZ4 uses the named bindings to retain only the linked services needed by the handler. Passing an entire context object or spreading it keeps all linked services available.

> Gateway handlers use the context declared by their [HTTP service](./http-service.md), [WebSocket service](./ws-service.md), or [provider](./gateway-provider.md).

## Handler middlewares

HTTP and WebSocket handlers can be wrapped with ordered [middleware](./gateway-middleware.md). Gateway default middleware executes before route-specific middleware.

> Context references are inferred from parameter destructuring. Destructuring keeps only the named services; accepting the context without destructuring or using a spread keeps all linked services available. Services used only by a [middleware](../../../documentation/middlewares.md) or lifecycle listener must be destructured there as well; otherwise, when they are absent from the handler destructuring, they can be omitted from the bundle.

## Handler listener

Gateway handlers can attach a lifecycle [listener](./gateway-listener.md) to observe validation and execution events. Listeners do not wrap or control handler execution.

#### HTTP Request fields

Handlers receive a typed request object generated from the route request type.
Depending on the route definition, the request may include:

- **Identity** - Identity returned by the authorizer.
- **Headers** - Typed HTTP headers.
- **Parameters** - Typed path parameters.
- **Query** - Typed query strings.
- **Body** - Typed JSON or raw string payload.

All fields are validated and transformed according to the declared route schema, as mentioned in the HTTP [requests](./http-requests.md) documentation.

#### HTTP Response fields

Handlers must return a typed response object that matches the route's response type.

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
export function myHandler(request: Ws.Incoming<MyMessage>, { myClient, myVariables }: Service.Context<MyServer>): MyResponse {
  // Access only the linked context services declared here.
  myClient.doSomething();
  myVariables.myVariable;

  return {
    body: {
      message: 'Hello WS Gateway'
    }
  };
}
```

#### Connection handlers

Used for **connect** and **disconnect** events.

```ts
export function connectionHandler(request: Ws.Incoming<MyEvent>, { myClient, myVariables }: Service.Context<MyServer>) {
  // Access only the linked context services declared here.
  myClient.doSomething();
  myVariables.myVariable;
}
```

#### WS Request fields (message handlers)

Handlers receive a typed object generated from the declared request type.
Depending on the route definition, the request may include:

- **Identity** - Identity returned by the connect authorizer.
- **Body** - Typed JSON or raw string payload.

All fields are validated and transformed according to the declared request type, as mentioned in the WS [requests](./ws-requests.md) documentation.

#### WS Response fields (message handlers)

Handlers must return a typed response object that matches the declared response type.

- **Body** - Optional JSON or raw string payload.

WebSocket responses do not include status codes or headers; Unknown fields are automatically removed, as per the WS [responses](./ws-responses.md) documentation.

#### WS Event fields (connect and disconnect handlers)

Handlers receive a typed object generated from the declared event type.
Depending on the route definition, the event may include:

- **Identity** - Identity returned by the connect authorizer.
- **Headers** - Typed HTTP headers captured during connect (copied to disconnect).
- **Query** - Typed query strings captured during connect (copied to disconnect).

All fields are validated and transformed according to the declared event type, as mentioned in the WS [events](./ws-events.md) documentation.

#### WS Error handling

Exceptions are automatically captured:

- Errors thrown in the **connect** handler prevent the connection from being established.
- Errors thrown in the **message** handler are formatted and sent back through the connection.
- Errors in the **disconnect** handler are logged only, since the connection is already closed.

## What's next

- [HTTP routes](./http-routes.md)
- [WebSocket routes](./ws-routes.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway listener](./gateway-listener.md)
- [Gateway middlewares](./gateway-middleware.md)
- [Gateway providers](./gateway-provider.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
