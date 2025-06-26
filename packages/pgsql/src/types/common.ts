import type { Order, Query, TableMetadata } from '@ez4/database';
import type { AnyObject } from '@ez4/utils';

export type SqlColumn = string | [string, string];

export type SqlFilters = Query.WhereInput<InternalTableMetadata>;

export type SqlRecord = Record<string, unknown>;

export type SqlOrder = Record<string, Order | undefined>;

export const enum SqlOperator {
  Equal = 'equal',
  NotEqual = 'not',
  GreaterThan = 'gt',
  GreaterThanOrEqual = 'gte',
  LessThan = 'lt',
  LessThanOrEqual = 'lte',
  IsIn = 'isIn',
  IsBetween = 'isBetween',
  IsMissing = 'isMissing',
  IsNull = 'isNull',
  StartsWith = 'startsWith',
  Contains = 'contains'
}

type InternalTableMetadata = TableMetadata & {
  schema: AnyObject;
};
