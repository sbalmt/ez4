import type { Environment, Service } from '@ez4/common';

class TestServiceA {
  public helloWorld() {}
}

export declare class TestServiceAFactory extends Service.Factory<TestServiceA> {
  initializer: typeof testServiceAInitializer;

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

export declare class TestServiceBFactory extends Service.Factory<void> {
  initializer: typeof testServiceBInitializer;

  services: {
    serviceA: Environment.Service<TestServiceAFactory>;
  };
}

export function testServiceBInitializer(context: Service.Context<TestServiceBFactory>) {
  const { serviceA } = context;

  serviceA.helloWorld();
}
