import type { Environment } from '@ez4/common';

// Concrete class is not allowed.
export class TestService {}

export declare class ServiceCommonTest {
  services: {
    // @ts-expect-error Client is missing on purpose.
    testService: Environment.Service<TestService>;
  };
}
