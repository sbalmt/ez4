import type {
  ParametersMode,
  TransactionMode,
  InsensitiveMode,
  UndefinedMode,
  PaginationMode,
  RelationMode,
  OrderMode,
  StreamMode,
  LockMode
} from '@ez4/database';

/**
 * Default Postgres engine settings.
 */
export type PostgresEngine = {
  parametersMode: ParametersMode.NameAndIndex;
  transactionMode: TransactionMode.Interactive;
  insensitiveMode: InsensitiveMode.Enabled;
  undefinedMode: UndefinedMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  relationMode: RelationMode.Supported;
  orderMode: OrderMode.AnyColumns;
  streamMode: StreamMode.Unsupported;
  lockMode: LockMode.Supported;
  options: never;
  name: 'pg-client';
};
