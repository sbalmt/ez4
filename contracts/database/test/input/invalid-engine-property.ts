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

export declare class TestDatabase extends Database.Service<{
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  insensitiveMode: InsensitiveMode.Unsupported;
  undefinedMode: UndefinedMode.Supported;
  paginationMode: PaginationMode.Offset;
  relationMode: RelationMode.Supported;
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Unsupported;
  options: never;
  name: 'test';

  // No extra property is allowed.
  invalid_property: true;
}> {
  tables: [];
}
