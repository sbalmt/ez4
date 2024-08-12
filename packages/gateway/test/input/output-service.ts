import type { Environment } from '@ez4/common';
import type { Http } from '@ez4/gateway';

/**
 * First test service description.
 */
export declare class TestService1 extends Http.Service {
  name: 'Test Service 1';

  routes: [];
}

/**
 * Description of the second test service.
 */
export declare class TestService2 extends Http.Service {
  routes: [];

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}
