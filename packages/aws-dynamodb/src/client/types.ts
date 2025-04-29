import type { ParametersType, TransactionType } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

export type Repository = Record<string, RepositoryTable>;

export type RepositoryTable = {
  name: string;
  indexes: string[][];
  schema: ObjectSchema;
};

/**
 * Default DynamoDB engine settings.
 */
export type DynamoDbEngine = {
  transaction: TransactionType.Static;
  parameters: ParametersType.OnlyIndex;
  name: 'dynamodb';
};
