import type { Environment } from '@ez4/common';
import type { Database } from '@ez4/database';

/**
 * Test database 1.
 */
export declare class TestDatabase1 extends Database.Service {
  tables: [];

  // Services to all streams.
  services: {
    testQueue: Environment.Service<TestDatabase2>;
  };
}

/**
 * Test database 2.
 */
export declare class TestDatabase2 extends Database.Service {
  tables: [];

  // Variables to all streams.
  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}
