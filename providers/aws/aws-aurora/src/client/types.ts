import type { InsensitiveMode, LockMode, OrderMode, PaginationMode, ParametersMode, StreamMode, TransactionMode } from '@ez4/database';

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
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Supported;
  options: ClientOptions;
  name: 'aurora';
};
