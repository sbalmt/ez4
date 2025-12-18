import type { Environment } from '@ez4/common';

export declare class TestService {
  client: never;
}

export declare class ServiceCommonTest {
  services: {
    testService: Environment.Service<TestService>;
  };
}
