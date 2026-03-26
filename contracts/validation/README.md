# EZ4: Validation

The Validation contract defines composable validation services for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your validation handler, variables, and connected services, then generates runtime bindings required to validate inputs and enforce schemas.

## Getting started

#### Install

```sh
npm install @ez4/validation -D
```

#### Create a validation service

Validation services are ideal for reusable schema enforcement, input sanitization, and domain‑specific validation logic that can be injected into any other contract.

```ts
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
```

#### Handle validation

EZ4 injects all variables and services, then invokes your validation handler with the input and schema.

```ts
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

Any handler with access to the validation service can perform validation.

```ts
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

> This makes it easy to centralize and reuse validation logic across your application.

With your validation service defined, EZ4 handles injection, execution, and schema wiring automatically according to your contract.

## Examples

- [Schedule manager](../../examples/aws-schedule-manager)
- [Aurora RDS CRUDL](../../examples/aws-aurora-crudl)

## License

MIT License
