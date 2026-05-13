import type { Factory } from '@ez4/factory';

export interface TestService {
  helloWorld(): string;
}

export declare class TestServiceFactory extends Factory.Service<TestService> {
  handler: typeof testServiceAInitializer;
}

export function testServiceAInitializer() {
  const name = 'hey';

  return {
    helloWorld: () => name
  };
}
