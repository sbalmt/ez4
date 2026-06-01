import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';

export type TestInput = {
  nameA: string;
  nameB: string;
};

export declare class TestServiceAValidation extends Validation.Service<TestInput> {
  handler: typeof testServiceAInitializer;

  services: {
    // Call serviceB (which will call serviceA)
    serviceB: Environment.Service<TestServiceBValidation>;
  };
}

export async function testServiceAInitializer(input: Validation.Input<TestInput>, context: Service.Context<TestServiceAValidation>) {
  const { value } = input;

  if (!value.nameA) {
    throw new Error('Missing input name A');
  }

  if (!value.nameB) {
    await context.serviceB.validate(value);
  }
}

export declare class TestServiceBValidation extends Validation.Service<TestInput> {
  handler: typeof testServiceBInitializer;

  services: {
    // Call serviceA (which will call serviceB)
    serviceA: Environment.Service<TestServiceAValidation>;
  };
}

export async function testServiceBInitializer(input: Validation.Input<TestInput>, context: Service.Context<TestServiceBValidation>) {
  const { value } = input;

  if (!value.nameA) {
    await context.serviceA.validate(value);
  }

  if (!value.nameB) {
    throw new Error('Missing input name B');
  }
}
