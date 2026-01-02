import type { InsensitiveMode, LockMode, OrderMode, PaginationMode, ParametersMode, TransactionMode } from '@ez4/database';
import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [];
}

// Missing Database.Engine inheritance.
declare class TestEngine {
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Unsupported;
  name: 'test';
}
