import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';

type Schema = {
  foo: string;
  bar: number;
};

export declare class TestValidation extends Validation.Service<Schema> {
  handler: typeof performValidation;

  variables: {
    TEST_VAR: 'test-var';
  };

  services: {
    selfVariables: Environment.ServiceVariables;
  };
}

export function performValidation(input: Validation.Input<Schema>, context: Service.Context<TestValidation>) {
  const { selfVariables } = context;

  // Ensure test variable
  selfVariables.TEST_VAR;

  // Ensure input
  input.schema;
  input.value;
}
