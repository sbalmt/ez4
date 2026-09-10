import type { Factory } from '@ez4/factory';
import type { Environment, Service } from '@ez4/common';

class TestService {}

export declare class TestServiceFactory extends Factory.Service<TestService> {
  handler: typeof testServiceInitializer;

  services: {
    selfFactory: Environment.Service<TestServiceFactory>;
  };
}

export function testServiceInitializer({}: Service.Context<TestServiceFactory>) {
  return new TestService();
}
