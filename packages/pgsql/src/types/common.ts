import type { Query } from '@ez4/database';

export type SqlColumn = string | [string, string];

export type SqlRecord = Record<string, unknown>;

export type SqlFilters = Query.WhereInput<SqlRecord>;

export type SqlOrder = Query.OrderInput<any>;

export const enum SqlOperator {
  Equal = 'equal',
  Not = 'not',
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
