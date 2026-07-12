import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';

export type TestInput = {
  data: string;
};

export const enum TestLevel {
  First = 0,
  Nested = 1
}

export declare class TestOptionsIsolation extends Validation.Service<TestInput> {
  handler: typeof testServiceInitializer;

  services: {
    options: Environment.ServiceOptions;
    isolated: Environment.Service<TestOptionsIsolation>;
  };

  options: {
    level: TestLevel;
  };
}

export async function testServiceInitializer(input: Validation.Input<TestInput>, context: Service.Context<TestOptionsIsolation>) {
  const { options, isolated } = context;
  const { value } = input;

  if (options.level === TestLevel.Nested) {
    return isolated.validate(value);
  }

  switch (options.level) {
    default: {
      if (value.data !== 'B') {
        throw new Error('Nested level must have data "B".');
      }

      break;
    }

    case TestLevel.First: {
      if (value.data !== 'A') {
        throw new Error('First level must have data "A".');
      }

      break;
    }
  }
}
