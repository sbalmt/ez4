# EZ4: Factory

The Factory contract defines composable service factories for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your factory handler, variables, and connected services, then generates runtime bindings required to construct and combine service instances.

## Getting started

#### Install

```sh
npm install @ez4/factory -D
```

#### Create a factory service

Factories are not infrastructure resources. Instead, they provide an organizational layer that other contracts can inject to create reusable, structured service objects.

```ts
// file: factory.ts
import type { Environment, Service } from '@ez4/common';
import type { Factory } from '@ez4/factory';

class MyService {
  public helloWorld() {}
}

// MyFactory declaration
export declare class MyFactory extends Factory.Service<MyService> {
  handler: typeof createMyService;

  variables: {
    myVariable: Environment.Variable<'MY_VARIABLE'>;
  };

  services: {
    otherService: Environment.Service<OtherService>;
    variables: Environment.ServiceVariables;
  };
}
```

#### Handle service creation

EZ4 injects all variables and services, then invokes your factory handler to construct the service instance.

```ts
// MyFactory handler
export function createMyService(context: Service.Context<MyFactory>): MyService {
  const { otherService, variables } = context;

  // Access injected services
  otherService.call();

  // Access injected variables
  variables.myVariable;

  // Return service instance
  return new MyService();
}
```

#### Use a factory

Any handler with access to the factory service can call the constructed service instance.

```ts
import type { Service } from '@ez4/common';
import type { MyFactory } from './factory';

// Any other handler that has injected MyFactory service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myFactory } = context;

  // Call my service
  myFactory.helloWorld();
}
```

> This makes it easy to centralize service creation and reuse logic across your application.

With your factory defined, EZ4 handles injection, construction, and service wiring automatically according to your contract.

## Examples

- [Schedule manager](../../examples/aws-schedule-manager)

## License

MIT License
