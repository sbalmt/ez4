import type { Environment } from '@ez4/common';

export declare class TestService {}

export declare class ServiceCommonTest {
  services: {
    // @ts-expect-error Client is missing on purpose.
    testService: Environment.Service<TestService>;
  };
}
