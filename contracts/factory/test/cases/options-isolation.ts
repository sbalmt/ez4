import type { Environment, Service } from '@ez4/common';
import type { Factory } from '@ez4/factory';

export interface TestService {
  labelName(): string;
}

export const enum TestLevel {
  First = 0,
  Nested = 1
}

export declare class TestOptionsIsolation extends Factory.Service<TestService> {
  handler: typeof testServiceInitializer;

  services: {
    options: Environment.ServiceOptions;
    isolated: Environment.Service<TestOptionsIsolation>;
  };

  options: {
    level: TestLevel;
  };
}

export function testServiceInitializer(context: Service.Context<TestOptionsIsolation>) {
  const { options } = context;

  if (options.level === TestLevel.Nested) {
    return {
      labelName: () => context.isolated.labelName()
    };
  }

  return {
    labelName: () => {
      switch (options.level) {
        default:
          return 'B';

        case TestLevel.First:
          return 'A';
      }
    }
  };
}
