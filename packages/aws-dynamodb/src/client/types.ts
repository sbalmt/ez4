import type { ParametersMode, TransactionMode, PaginationMode, OrderMode } from '@ez4/database';
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
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  paginationMode: PaginationMode.Cursor;
  orderMode: OrderMode.IndexColumns;
  name: 'dynamodb';
};
