import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';

type TestInput = {
  foo: string;
  bar: number;
};

/**
 * Internal validation description.
 *
 * @description Test validation service.
 */
export declare class TestValidation extends Validation.Service<TestInput> {
  handler: typeof performValidation;

  options: {
    testFlag: false;
  };

  variables: {
    TEST_VAR: 'test-var';
  };

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
  };
}

export function performValidation(input: Validation.Input<TestInput>, context: Service.Context<TestValidation>) {
  const { selfOptions, selfVariables } = context;

  // Ensure test flag
  selfOptions.testFlag;

  // Ensure test variable
  selfVariables.TEST_VAR;

  // Ensure input
  input.schema;
  input.value;
}
