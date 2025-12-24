# EZ4: Validation

The validation contract uses the project's reflection utilities [(see foundation/reflection)](../../foundation/reflection/) to build composable validation services. It provides a lightweight layer that other contracts can inject to validate inputs and enforce schemas.

## Getting started

#### Install

```sh
npm install @ez4/validation -D
```

#### Create validation

```ts
// file: validation.ts
import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';

// MyValidation declaration
export declare class MyValidation extends Validation.Service<MyService> {
  handler: typeof validateInput;

  variables: {
    myVariable: Environment.Variable<'MY_VARIABLE'>;
  };

  services: {
    otherService: Environment.Service<OtherService>;
    variables: Environment.ServiceVariables;
  };
}

// MyValidation handler
export function validateInput(input: Validation.Input, context: Service.Context<MyValidation>) {
  const { otherService, variables } = context;

  // Access injected services
  otherService.call();

  // Access injected variables
  variables.myVariable;

  // Access validation value
  input.value;

  // Access validation schema
  input.schema;
}
```

#### Use validation

```ts
// file: handler.ts
import type { Service } from '@ez4/common';
import type { MyValidation } from './validation';

// Any other handler that has injected MyValidation service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myValidation } = context;

  // Perform validation
  myValidation.validate({
    foo: 'foo',
    bar: 123
  });
}
```

## Examples

- [Schedule manager](../../examples/aws-schedule-manager)
- [Aurora RDS CRUDL](../../examples/aws-aurora-crudl)

## License

MIT License
