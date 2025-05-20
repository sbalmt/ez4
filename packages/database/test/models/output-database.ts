import type { Database, ParametersMode, TransactionMode, PaginationMode, OrderMode } from '@ez4/database';
import type { Environment } from '@ez4/common';

/**
 * Test database 1.
 */
export declare class TestDatabase1 extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    paginationMode: PaginationMode.Offset;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

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
  engine: {
    parametersMode: ParametersMode.NameAndIndex;
    transactionMode: TransactionMode.Interactive;
    paginationMode: PaginationMode.Cursor;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

  tables: [];

  // Variables to all streams.
  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}
