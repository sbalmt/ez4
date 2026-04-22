# EZ4: Gateway

The Gateway contract defines your application's HTTP and WebSocket interface. It uses EZ4's [reflection](../../foundation/reflection/) to analyze your route definitions, request/response types, variables, and connected services, and then generates the infrastructure and runtime bindings required to serve your API.

## Getting started

#### Install

```sh
npm install @ez4/gateway @ez4/local-gateway @ez4/aws-gateway -D
```

#### Create an HTTP gateway

HTTP Gateways are ideal for building REST APIs, webhooks, or any HTTP‑based entry point.

```ts
import type { Environment, Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

// MyServer declaration
export declare class MyServer extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'POST /post-route';
      handler: typeof postHandler;
    }>
  ];
}
```

> For more details, check the HTTP [service](./docs/http-service.md) documentation.

#### Define request and response types

Request and response types are plain TypeScript classes. EZ4 reflects over them to generate validation, serialization, and cloud integration.

```ts
// MyServer route request
declare class MyRequest implements Http.Request {
  body: {
    foo: string;
    bar: number;
  };
}

// MyServer route response
declare class MyResponse implements Http.Response {
  status: 201;
  body: {
    baz: string;
  };
}
```

> For more details, check the HTTP [requests](./docs/http-requests.md) and [responses](./docs/http-responses.md) documentation.

#### Provide variables and services

Each provider can declare environment variables and connected services (other EZ4 resources) that are injected automatically into the handler context.

```ts
// MyServer route provider
interface MyProvider extends Http.Provider {
  variables: {
    myVariable: Environment.Variable<'MY_VARIABLE'>;
  };

  services: {
    otherService: Environment.Service<OtherService>;
    variables: Environment.ServiceVariables;
  };
}
```

> For more details, check the gateway [provider](./docs/gateway-provider.md) documentation.

#### Handle requests

EZ4 wires together the request, response, and provider context automatically before invoking the handler. By the time your handler runs, the request has already been validated and the response will be automatically shaped according to your response type.

```ts
// MyServer route handler
export function postHandler(request: Http.Incoming<MyRequest>, context: Service.Context<MyProvider>): MyResponse {
  const { otherService, variables } = context;
  const { body } = request;

  // Access body contents
  body.foo;

  // Access injected services
  otherService.call();

  // Access injected variables
  variables.myVariable;

  return {
    status: 201,
    body: {
      baz: 'baz'
    }
  };
}
```

> For more details, check the gateway [handler](./docs/gateway-handler.md) documentation.

## What's next

- [HTTP service](./docs/http-service.md)
- [WebSocket service](./docs/ws-service.md)
- [Gateway handlers](./docs/gateway-handler.md)
- [Gateway authorizers](./docs/gateway-authorizer.md)
- [Gateway listeners](./docs/gateway-listener.md)
- [Gateway providers](./docs/gateway-provider.md)
- [Gateway defaults](./docs/gateway-defaults.md)

## Examples

- [Get started with API gateway](../../examples/hello-aws-gateway)
- [API Gateway authorizer](../../examples/aws-gateway-authorizer)
- [API Gateway websocket](../../examples/aws-gateway-websocket)
- [Importing gateway](../../examples/aws-import-gateway)
- [Aurora RDS CRUDL](../../examples/aws-aurora-crudl)
- [DynamoDB CRUDL](../../examples/aws-dynamodb-crudl)
- [Schedule manager](../../examples/aws-schedule-manager)
- [Storage manager](../../examples/aws-storage-manager)

## Providers

- [Local provider](../../providers/local/local-gateway)
- [AWS provider](../../providers/aws/aws-gateway)

## License

MIT License
