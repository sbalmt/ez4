import type { ParametersMode, TransactionMode, PaginationMode, OrderMode, InsensitiveMode, LockMode, StreamMode } from '@ez4/database';

/**
 * Default Postgres engine settings.
 */
export type PostgresEngine = {
  parametersMode: ParametersMode.NameAndIndex;
  transactionMode: TransactionMode.Interactive;
  insensitiveMode: InsensitiveMode.Enabled;
  paginationMode: PaginationMode.Offset;
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Supported;
  options: never;
  name: 'pg-client';
};
