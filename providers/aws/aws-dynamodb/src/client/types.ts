import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import type {
  TableMetadata,
  ParametersMode,
  TransactionMode,
  InsensitiveMode,
  UndefinedMode,
  PaginationMode,
  RelationMode,
  OrderMode,
  StreamMode,
  LockMode
} from '@ez4/database';

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
  undefinedMode: UndefinedMode.Supported;
  paginationMode: PaginationMode.Cursor;
  relationMode: RelationMode.Unsupported;
  orderMode: OrderMode.IndexColumns;
  streamMode: StreamMode.Supported;
  lockMode: LockMode.Unsupported;
  options: never;
  name: 'dynamodb';
};

/**
 * Internal table metadata.
 */
export type InternalTableMetadata = TableMetadata & {
  engine: DynamoDbEngine;
  schema: AnyObject;
};
