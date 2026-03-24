import type { Factory } from '@ez4/factory';

interface TestService {
  helloWorld(): void;
}

export declare class TestFactory extends Factory.Service<TestService> {
  handler: typeof factory;
}

export function factory() {
  return {
    helloWorld: () => {
      // do nothing...
    }
  };
}
