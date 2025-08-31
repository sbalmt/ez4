import type { Environment } from '@ez4/common';
import type { Database, OrderMode, PaginationMode, TransactionMode } from '@ez4/database';
import type { TestEngineOrder, TestEnginePagination, TestEngineTransaction } from '../common/engines.js';

/**
 * Test database 1.
 */
export declare class TestDatabase1 extends Database.Service {
  engine: TestEngineTransaction<TransactionMode.Interactive>;

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
  engine: TestEnginePagination<PaginationMode.Cursor>;

  tables: [];

  // Variables to all streams.
  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}

/**
 * Test database 3.
 */
export declare class TestDatabase3 extends Database.Service {
  engine: TestEngineOrder<OrderMode.IndexColumns>;

  tables: [];
}
