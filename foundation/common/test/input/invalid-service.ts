import type { Environment } from '@ez4/common';

// Concrete class is not allowed.
export class TestService {}

export declare class ServiceCommonTest {
  services: {
    testService: Environment.Service<TestService>;
  };
}
