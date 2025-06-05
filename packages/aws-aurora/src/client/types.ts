import type { ParametersMode, TransactionMode, PaginationMode, OrderMode, TableMetadata, InsensitiveMode } from '@ez4/database';
import type { Arn } from '@ez4/aws-common';

export type Connection = {
  resourceArn: Arn;
  secretArn: Arn;
  database: string;
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
  name: 'aurora';
};

/**
 * Internal table metadata.
 */
export type InternalTableMetadata = TableMetadata & {
  engine: PostgresEngine;
};
