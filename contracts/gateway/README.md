# EZ4: Gateway

The Gateway contract defines your application's HTTP interface. It uses EZ4's [reflection](../../foundation/reflection/) to analyze your route definitions, request/response types, variables, and connected services, and then generates the infrastructure and runtime bindings required to serve your API.

## Getting started

#### Install

```sh
npm install @ez4/gateway @ez4/local-gateway @ez4/aws-gateway -D
```

#### Create a gateway

Gateways are ideal for building REST APIs, webhooks, or any HTTP‑based entry point.

```ts
import type { Environment, Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

// MyServer declaration
export declare class MyServer extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'POST /post-route';
      handler: typeof routeHandler;
    }>
  ];
}
```

#### Define request and response types

Request and response types are plain TypeScript classes. EZ4 reflects over them to generate validation, serialization, and cloud integration.

```ts
// MyServer route request
declare class MyRouteRequest implements Http.Request {
  body: {
    foo: string;
    bar: number;
  };
}

// MyServer route response
declare class MyRouteResponse implements Http.Response {
  status: 201;
  body: {
    baz: string;
  };
}
```

#### Provide variables and services

Each provider can declare environment variables and connected services (other EZ4 resources) that are injected automatically into the handler context.

```ts
// MyServer route provider
interface MyRouteProvider extends Http.Provider {
  variables: {
    myVariable: Environment.Variable<'MY_VARIABLE'>;
  };

  services: {
    otherService: Environment.Service<OtherService>;
    variables: Environment.ServiceVariables;
  };
}
```

> For more details, check the [gateway provider](./docs/http-provider.md) documentation.

#### Handle requests

EZ4 wires together the request, response, and provider context automatically before invoking the handler. By the time your handler runs, the request has already been validated and the response will be automatically shaped according to your response type.

```ts
// MyServer route handler
export function routeHandler(request: Http.Incoming<MyRouteRequest>, context: Service.Context<MyRouteProvider>): MyRouteResponse {
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

## Gateway properties

#### Service

| Name      | Type               | Description                                       |
| --------- | ------------------ | ------------------------------------------------- |
| routes    | Http.UseRoute<>    | All routes associated with the gateway.           |
| defaults  | Http.UseDefaults<> | Default gateway parameters.                       |
| cors      | Http.UseCors<>     | CORS configuration for all routes.                |
| cache     | Http.UseCache<>    | Cache configuration for authorizers.              |
| access    | Http.UseAccess<>   | Access configuration for logs.                    |
| name      | string             | Display name for the service.                     |
| variables | object             | Environment variables associated with all routes. |
| services  | object             | Injected services associated with all routes.     |

> Use type helpers for `routes`, `defaults`, `cors`, `cache` and `access` properties.

#### Routes

| Name         | Type                  | Description                                                 |
| ------------ | --------------------- | ----------------------------------------------------------- |
| name         | string                | Route operation name.                                       |
| path         | string                | Route path including the HTTP verb.                         |
| listener     | function              | Life-cycle listener function for the route.                 |
| handler      | function              | Entry-point handler function for the route.                 |
| authorizer   | function              | Authorizer function for the route.                          |
| httpErrors   | object                | Map status codes and errors for all known exceptions.       |
| variables    | object                | Environment variables associated with the route.            |
| logRetention | integer               | Log retention (in days) for the handler.                    |
| logLevel     | LogLevel              | Log level for the handler.                                  |
| preferences  | Http.UsePreferences<> | Route preference options.                                   |
| architecture | ArchitectureType      | Architecture type for the cloud function.                   |
| runtime      | RuntimeType           | Runtime for the cloud function.                             |
| files        | string[]              | Additional resource files added into the handler bundle.    |
| memory       | integer               | Memory available (in megabytes) for the handler.            |
| timeout      | integer               | Max execution time (in seconds) for the route.              |
| disabled     | boolean               | Determines whether or not the route is disabled.            |
| debug        | boolean               | Determine whether the debug mode is active for the handler. |
| cors         | boolean               | Determines whether or not CORS is enabled for the route.    |
| vpc          | boolean               | Determines whether or not VPC is enabled for the route.     |

> For more details, check the [gateway routes](./docs/http-routes.md) documentation.

With your gateway defined, EZ4 handles routing, validation, dependency injection, and execution automatically according to your contract.

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
