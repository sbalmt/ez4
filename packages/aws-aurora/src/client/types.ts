import type { ParametersMode, TransactionMode, OrderMode } from '@ez4/database';
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
  orderMode: OrderMode.AnyColumns;
  name: 'aurora';
};
