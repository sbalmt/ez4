import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';

type TestInput = {
  value: string;
};

export declare class TestValidation extends Validation.Service<TestInput> {
  handler: typeof handler;

  services: {
    selfValidation: Environment.Service<TestValidation>;
  };
}

export function handler(_input: Validation.Input<TestInput>, {}: Service.Context<TestValidation>) {}
