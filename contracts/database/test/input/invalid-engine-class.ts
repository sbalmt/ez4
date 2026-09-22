import type {
  Database,
  ParametersMode,
  TransactionMode,
  InsensitiveMode,
  UndefinedMode,
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

// Concrete class is not allowed.
class TestEngine implements Database.Engine {
  parametersMode!: ParametersMode.OnlyIndex;
  transactionMode!: TransactionMode.Static;
  insensitiveMode!: InsensitiveMode.Unsupported;
  undefinedMode!: UndefinedMode.Supported;
  paginationMode!: PaginationMode.Offset;
  relationMode!: RelationMode.Unsupported;
  streamMode!: StreamMode.Unsupported;
  orderMode!: OrderMode.AnyColumns;
  lockMode!: LockMode.Unsupported;
  options!: never;
  name!: 'test';
}
