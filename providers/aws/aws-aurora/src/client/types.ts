import type { InsensitiveMode, LockMode, OrderMode, PaginationMode, ParametersMode, TransactionMode } from '@ez4/database';

/**
 * Postgres connection mode.
 */
export const enum ConnectionMode {
  Native = 'native',
  Api = 'api'
}

/**
 * Service client options.
 */
export type ClientOptions = {
  connectionMode?: ConnectionMode;
};

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
  options: ClientOptions;
  name: 'aurora';
};
