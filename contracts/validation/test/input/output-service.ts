import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';

type TestInput = {
  foo: string;
  bar: number;
};

export declare class TestValidation extends Validation.Service<TestInput> {
  handler: typeof performValidation;

  variables: {
    TEST_VAR: 'test-var';
  };

  services: {
    selfVariables: Environment.ServiceVariables;
  };
}

export function performValidation(input: Validation.Input<TestInput>, context: Service.Context<TestValidation>) {
  const { selfVariables } = context;

  // Ensure test variable
  selfVariables.TEST_VAR;

  // Ensure input
  input.schema;
  input.value;
}
