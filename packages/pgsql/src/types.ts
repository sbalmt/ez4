export type SqlColumnName = string | [string, string];

export type SqlStatementRecord = Record<string, unknown>;

export type SqlStatement = {
  readonly alias?: string;
};

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
