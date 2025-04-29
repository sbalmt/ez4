import type { TransactionType, ParametersType } from '@ez4/database';
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
  transaction: TransactionType.Interactive;
  parameters: ParametersType.NameAndIndex;
  name: 'aurora';
};
