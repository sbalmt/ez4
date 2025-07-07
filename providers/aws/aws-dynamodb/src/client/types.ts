import type { ParametersMode, TransactionMode, PaginationMode, OrderMode, InsensitiveMode, TableMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

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
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: PaginationMode.Cursor;
  orderMode: OrderMode.IndexColumns;
  name: 'dynamodb';
};

/**
 * Internal table metadata.
 */
export type InternalTableMetadata = TableMetadata & {
  engine: DynamoDbEngine;
  schema: AnyObject;
};
