import type {
  ParametersMode,
  TransactionMode,
  InsensitiveMode,
  PaginationMode,
  RelationMode,
  StreamMode,
  OrderMode,
  LockMode
} from '@ez4/database';

/**
 * Default Postgres engine settings.
 */
export type PostgresEngine = {
  parametersMode: ParametersMode.NameAndIndex;
  transactionMode: TransactionMode.Interactive;
  insensitiveMode: InsensitiveMode.Enabled;
  paginationMode: PaginationMode.Offset;
  relationMode: RelationMode.Supported;
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Supported;
  options: never;
  name: 'pg-client';
};
