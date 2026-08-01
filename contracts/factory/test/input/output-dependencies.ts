import type { Environment, Service } from '@ez4/common';
import type { Factory } from '@ez4/factory';

class TestService {}

export declare class TestServiceFactory extends Factory.Service<TestService> {
  handler: typeof testServiceInitializer;

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
    selfFactory: Environment.Service<TestServiceFactory>;
  };
}

// Do not expose `selfFactory` so it should not be a dependency.
export function testServiceInitializer({ selfOptions, selfVariables }: Service.Context<TestServiceFactory>) {
  selfVariables;
  selfOptions;

  return new TestService();
}
