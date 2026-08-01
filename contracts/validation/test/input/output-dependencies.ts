import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';

type TestInput = {
  foo: string;
  bar: number;
};

export declare class TestValidation extends Validation.Service<TestInput> {
  handler: typeof performValidation;

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
    selfValidation: Environment.Service<TestValidation>;
  };
}

export function performValidation(_input: Validation.Input<TestInput>, { selfOptions, selfVariables }: Service.Context<TestValidation>) {
  selfVariables;
  selfOptions;
}
