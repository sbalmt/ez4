import type { Environment, Service } from '@ez4/common';
import type { Factory } from '@ez4/factory';

export interface TestService {
  buildName(): string;
  labelName(): string;
}

export declare class TestServiceAFactory extends Factory.Service<TestService> {
  handler: typeof testServiceAInitializer;

  services: {
    // Call serviceB (which will call serviceA)
    serviceB: Environment.Service<TestServiceBFactory>;
  };
}

export function testServiceAInitializer(context: Service.Context<TestServiceAFactory>) {
  const name = 'A';

  return {
    labelName: () => name,
    buildName: () => {
      return name + context.serviceB.labelName();
    }
  };
}

export declare class TestServiceBFactory extends Factory.Service<TestService> {
  handler: typeof testServiceBInitializer;

  services: {
    // Call serviceA (which will call serviceB)
    serviceA: Environment.Service<TestServiceAFactory>;
  };
}

export function testServiceBInitializer(context: Service.Context<TestServiceBFactory>) {
  const name = 'B';

  return {
    labelName: () => name,
    buildName: () => {
      return name + context.serviceA.labelName();
    }
  };
}
