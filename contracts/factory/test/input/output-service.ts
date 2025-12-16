import type { Environment, Service } from '@ez4/common';
import type { Factory } from '@ez4/factory';

class TestServiceA {
  public helloWorld() {}
}

export declare class TestServiceAFactory extends Factory.Service<TestServiceA> {
  handler: typeof testServiceAInitializer;

  variables: {
    TEST_VAR: 'test-var';
  };

  services: {
    selfVariables: Environment.ServiceVariables;
  };
}

export function testServiceAInitializer(context: Service.Context<TestServiceAFactory>) {
  const { selfVariables } = context;

  // Ensure test variable
  selfVariables.TEST_VAR;

  return new TestServiceA();
}

export declare class TestServiceBFactory extends Factory.Service<void> {
  handler: typeof testServiceBInitializer;

  services: {
    serviceA: Environment.Service<TestServiceAFactory>;
  };
}

export function testServiceBInitializer(context: Service.Context<TestServiceBFactory>) {
  const { serviceA } = context;

  serviceA.helloWorld();
}
