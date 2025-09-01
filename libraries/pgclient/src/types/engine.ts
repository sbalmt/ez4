import type { ParametersMode, TransactionMode, PaginationMode, OrderMode, InsensitiveMode, LockMode } from '@ez4/database';

/**
 * Default Postgres engine settings.
 */
export type PostgresEngine = {
  parametersMode: ParametersMode.NameAndIndex;
  transactionMode: TransactionMode.Interactive;
  insensitiveMode: InsensitiveMode.Enabled;
  paginationMode: PaginationMode.Offset;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Supported;
  name: 'pg-client';
};
