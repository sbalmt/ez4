import type {
  Database,
  ParametersMode,
  TransactionMode,
  InsensitiveMode,
  PaginationMode,
  RelationMode,
  StreamMode,
  OrderMode,
  LockMode
} from '@ez4/database';

export declare class TestDatabase extends Database.Service<TestEngine> {
  engine: TestEngine;

  tables: [];
}

// Missing Database.Engine inheritance.
declare class TestEngine {
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  relationMode: RelationMode.Supported;
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Unsupported;
  options: never;
  name: 'test';
}
