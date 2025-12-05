# EZ4: Gateway

It uses the power of [reflection](../../foundation/reflection/) to provide a contract that determines how to build and connect gateway components.

## Getting started

#### Install

```sh
npm install @ez4/gateway @ez4/local-gateway @ez4/aws-gateway -D
```

#### Create gateway

```ts
// file: server.ts
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

// MyServer route handler
export function routeHandler(
  request: Http.Incoming<MyRouteRequest>,
  context: Service.Context<MyRouteProvider>
): MyRouteResponse {
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

| Name      | Type               | Description                                     |
| --------- | ------------------ | ----------------------------------------------- |
| routes    | Http.UseRoute<>    | All routes associated to the gateway.           |
| defaults  | Http.UseDefaults<> | Default gateway parameters.                     |
| cors      | Http.UseCors<>     | CORS configuration for all routes.              |
| cache     | Http.UseCache<>    | Cache configuration for authorizers.            |
| access    | Http.UseAccess<>   | Access configuration for logs.                  |
| name      | string             | Display name for the service.                   |
| variables | object             | Environment variables associated to all routes. |
| services  | object             | Injected services associated to all routes.     |

> Use type helpers for `routes`, `defaults`, `cors`, `cache` and `access` properties.

#### Routes

| Name         | Type     | Description                                              |
| ------------ | -------- | -------------------------------------------------------- |
| name         | string   | Route operation name.                                    |
| path         | string   | Route path including the HTTP verb.                      |
| listener     | function | Life-cycle listener function for the route.              |
| handler      | function | Entry-point handler function for the route.              |
| authorizer   | function | Authorizer function for the route.                       |
| httpErrors   | object   | Map status codes and errors for all known exceptions.    |
| variables    | object   | Environment variables associated to the route.           |
| logRetention | integer  | Log retention (in days) for the handler.                 |
| memory       | integer  | Memory available (in megabytes) for the handler.         |
| timeout      | integer  | Max execution time (in seconds) for the route.           |
| disabled     | boolean  | Determines whether or not the route is disabled.         |
| cors         | boolean  | Determines whether or not CORS is enabled for the route. |

## Examples

- [Get started with API gateway](../../examples/hello-aws-gateway)
- [API Gateway authorizer](../../examples/aws-gateway-authorizer)
- [Importing gateway](../../examples/aws-import-gateway)
- [Aurora RDS CRUDL](../../examples/aws-aurora-crudl)
- [DynamoDB CRUDL](../../examples/aws-dynamodb-crudl)

## Providers

- [Local provider](../../providers/local/local-gateway)
- [AWS provider](../../providers/aws/aws-gateway)

## License

MIT License
