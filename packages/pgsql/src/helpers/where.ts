import type { Query } from '@ez4/database';
import type { SqlBuilderReferences } from '../builder.js';
import type { SqlStatement, SqlStatementRecord } from '../types.js';

import { isAnyObject, isEmptyObject } from '@ez4/utils';

import { SqlOperator } from '../types.js';
import { mergeAlias, mergePath } from '../utils.js';
import { SqlColumnReference } from './reference.js';

import {
  InvalidOperandError,
  MissingOperatorsError,
  TooManyOperatorsError
} from '../errors/operation.js';

export type SqlWhereFilters = Query.WhereFields<SqlStatementRecord, {}>;

type SqlWhereContext = {
  statement: SqlStatement;
  references: SqlBuilderReferences;
  parent?: string;
};

type SqlWhereState = {
  statement: SqlStatement;
  references: SqlBuilderReferences;
  filters: SqlWhereFilters;
};

export class SqlWhereClause {
  #state: SqlWhereState;

  constructor(state: SqlWhereState) {
    this.#state = state;
  }

  get empty() {
    return isEmptyObject(this.#state.filters);
  }

  apply(filters: SqlWhereFilters) {
    this.#state.filters = filters;

    return this;
  }

  build(): [string, unknown[]] {
    const { statement, references, filters } = this.#state;

    const values: unknown[] = [];

    const operations = getOperations(filters, values, {
      references,
      statement
    });

    const clause = `WHERE ${operations.join(' AND ')}`;

    return [clause, values];
  }
}

const getOperations = (filters: SqlWhereFilters, values: unknown[], context: SqlWhereContext) => {
  const operations = [];

  for (const field in filters) {
    const value = filters[field];

    if (value === undefined) {
      continue;
    }

    const operation = getFieldOperation(field, value, values, context);

    if (operation) {
      operations.push(operation);
    }
  }

  return operations;
};

const getFieldOperation = (
  field: string,
  value: unknown,
  values: unknown[],
  context: SqlWhereContext
): string | undefined => {
  const { statement, references, parent } = context;

  switch (field) {
    case 'NOT': {
      if (Array.isArray(value) || !isAnyObject(value)) {
        throw new InvalidOperandError();
      }

      const operations = getOperations(value, values, context);

      if (operations.length) {
        return `NOT ${combineOperations(operations)}`;
      }

      break;
    }

    case 'AND':
    case 'OR': {
      if (!Array.isArray(value)) {
        throw new InvalidOperandError();
      }

      const operations = [];

      for (const current of value) {
        if (field === 'OR') {
          operations.push(combineOperations(getOperations(current, values, context)));
        } else {
          operations.push(...getOperations(current, values, context));
        }
      }

      if (operations.length) {
        return `(${operations.join(` ${field} `)})`;
      }

      break;
    }

    default: {
      const columnName = mergePath(field, parent);
      const columnPath = mergeAlias(columnName, statement.alias);

      if (value === null) {
        return getNullableOperation(columnPath, true);
      }

      if (value instanceof SqlColumnReference || !isAnyObject(value)) {
        return getEqualOperation(columnPath, value, values, references);
      }

      const [entry, ...rest] = Object.entries(value);

      if (!entry) {
        throw new MissingOperatorsError(columnName);
      }

      if (rest.length) {
        throw new TooManyOperatorsError(columnName);
      }

      const [operator, operand] = entry;

      const operation = getValueOperation(columnPath, operator, operand, values, references);

      return (
        operation ??
        combineOperations(
          getOperations(value, values, {
            ...context,
            parent: columnName
          })
        )
      );
    }
  }

  return undefined;
};

const getValueOperation = (
  column: string,
  operator: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  switch (operator) {
    case SqlOperator.IsNull:
    case SqlOperator.IsMissing:
      return getNullableOperation(column, operand);

    case SqlOperator.Equal:
      return getEqualOperation(column, operand, values, references);

    case SqlOperator.Not:
      return getNotEqualOperation(column, operand, values, references);

    case SqlOperator.GreaterThan:
      return getGreaterThanOperation(column, operand, values, references);

    case SqlOperator.GreaterThanOrEqual:
      return getGreaterThanOrEqualOperation(column, operand, values, references);

    case SqlOperator.LessThan:
      return getLessThanOperation(column, operand, values, references);

    case SqlOperator.LessThanOrEqual:
      return getLessThanOrEqualOperation(column, operand, values, references);

    case SqlOperator.IsIn:
      return getIsInOperation(column, operand, values, references);

    case SqlOperator.IsBetween:
      return getIsBetweenOperation(column, operand, values, references);

    case SqlOperator.StartsWith:
      return getStartsWithOperation(column, operand, values, references);

    case SqlOperator.Contains:
      return getContainsOperation(column, operand, values, references);
  }

  return undefined;
};

const getNullableOperation = (column: string, value: unknown) => {
  return `${column} IS ${value ? 'NULL' : 'NOT NULL'}`;
};

const getEqualOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  return `${column} = ${getOperandValue(operand, values, references)}`;
};

const getNotEqualOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  return `${column} != ${getOperandValue(operand, values, references)}`;
};

const getGreaterThanOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  return `${column} > ${getOperandValue(operand, values, references)}`;
};

const getGreaterThanOrEqualOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  return `${column} >= ${getOperandValue(operand, values, references)}`;
};

const getLessThanOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  return `${column} < ${getOperandValue(operand, values, references)}`;
};

const getLessThanOrEqualOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  return `${column} <= ${getOperandValue(operand, values, references)}`;
};

const getIsInOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  if (!Array.isArray(operand)) {
    throw new InvalidOperandError(column);
  }

  const list = operand.map((current) => getOperandValue(current, values, references));

  return `${column} IN (${list.join(', ')})`;
};

const getIsBetweenOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  if (!Array.isArray(operand)) {
    throw new InvalidOperandError(column);
  }

  const [begin, end] = operand.map((current) => getOperandValue(current, values, references));

  return `${column} BETWEEN ${begin} AND ${end}`;
};

const getStartsWithOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  return `${column} LIKE ${getOperandValue(operand, values, references)} || '%'`;
};

const getContainsOperation = (
  column: string,
  operand: unknown,
  values: unknown[],
  references: SqlBuilderReferences
) => {
  return `${column} LIKE '%' || ${getOperandValue(operand, values, references)} || '%'`;
};

const getOperandValue = (operand: unknown, values: unknown[], references: SqlBuilderReferences) => {
  if (operand instanceof SqlColumnReference) {
    return operand.toString();
  }

  values.push(operand);

  return `:${references.counter++}`;
};

const combineOperations = (operations: string[]) => {
  if (operations.length > 1) {
    return `(${operations.join(' AND ')})`;
  }

  return operations[0];
};
