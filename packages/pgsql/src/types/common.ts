import type { Order, Query, TableMetadata } from '@ez4/database';

export type SqlColumn = string | [string, string];

export type SqlRecord = Record<string, unknown>;

export type SqlFilters = Query.WhereInput<TableMetadata>;

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
