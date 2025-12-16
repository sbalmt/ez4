# EZ4: Factory

It uses the power of [reflection](../../foundation/reflection/) to provide a contract that determines how to build and combine services.

## Getting started

#### Install

```sh
npm install @ez4/factory -D
```

#### Create factory

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

#### Use factory

```ts
// file: handler.ts
import type { Service } from '@ez4/common';
import type { MyFactory } from './factory';

// Any other handler that has injected MyTopic service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myFactory } = context;

  // Call my service
  myFactory.helloWorld();
}
```

## License

MIT License
