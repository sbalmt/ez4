import type { SqlBuilderReferences } from '../builder.js';
import type { SqlStatement } from './statement.js';
import type { SqlFilters } from './common.js';

import { isAnyObject, isEmptyObject } from '@ez4/utils';

import { mergeSqlAlias, mergeSqlPath } from '../utils/merge.js';
import { SqlReference } from './reference.js';
import { SqlOperator } from './common.js';
import { SqlRaw } from './raw.js';

import {
  InvalidOperandError,
  MissingOperatorError,
  TooManyOperatorsError
} from '../errors/operation.js';

type SqlWhereContext = {
  statement: SqlStatement;
  references: SqlBuilderReferences;
  variables: unknown[];
  parent?: string;
};

type SqlWhereState = {
  statement: SqlStatement;
  references: SqlBuilderReferences;
  filters: SqlFilters;
};

export class SqlWhereClause {
  #state: SqlWhereState;

  constructor(statement: SqlStatement, references: SqlBuilderReferences, filters: SqlFilters = {}) {
    this.#state = {
      statement,
      references,
      filters
    };
  }

  get empty() {
    return isEmptyObject(this.#state.filters);
  }

  apply(filters: SqlFilters) {
    this.#state.filters = filters;

    return this;
  }

  build(): [string, unknown[]] {
    const { statement, references, filters } = this.#state;

    const context = {
      variables: [],
      references,
      statement
    };

    const operations = getOperations(filters, context);

    const clause = `WHERE ${operations.join(' AND ')}`;

    return [clause, context.variables];
  }
}

const getOperations = (filters: SqlFilters, context: SqlWhereContext) => {
  const operations = [];

  for (const field in filters) {
    const value = filters[field];

    if (value === undefined) {
      continue;
    }

    const operation = getFieldOperation(field, value, context);

    if (operation) {
      operations.push(operation);
    }
  }

  return operations;
};

const getFieldOperation = (
  field: string,
  value: unknown,
  context: SqlWhereContext
): string | undefined => {
  const { statement, references, variables, parent } = context;

  switch (field) {
    case 'NOT': {
      if (Array.isArray(value) || !isAnyObject(value)) {
        throw new InvalidOperandError();
      }

      const operations = getOperations(value, context);

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
          operations.push(combineOperations(getOperations(current, context)));
        } else {
          operations.push(...getOperations(current, context));
        }
      }

      if (operations.length) {
        return `(${operations.join(` ${field} `)})`;
      }

      break;
    }

    default: {
      const columnName = mergeSqlPath(field, parent);
      const columnPath = mergeSqlAlias(columnName, statement.alias);

      if (value === null) {
        return getNullableOperation(columnPath, true);
      }

      if (value instanceof SqlRaw || value instanceof SqlReference || !isAnyObject(value)) {
        return getEqualOperation(columnPath, value, variables, references);
      }

      const [entry, ...rest] = Object.entries(value);

      if (!entry) {
        throw new MissingOperatorError(columnName);
      }

      if (rest.length > 0) {
        throw new TooManyOperatorsError(columnName);
      }

      const [operator, operand] = entry;

      const operation = getValueOperation(columnPath, operator, operand, context);

      return (
        operation ??
        combineOperations(
          getOperations(value, {
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
  context: SqlWhereContext
) => {
  const { references, variables } = context;

  switch (operator) {
    case SqlOperator.IsNull:
    case SqlOperator.IsMissing:
      return getNullableOperation(column, operand);

    case SqlOperator.Equal:
      return getEqualOperation(column, operand, variables, references);

    case SqlOperator.Not:
      return getNotEqualOperation(column, operand, variables, references);

    case SqlOperator.GreaterThan:
      return getGreaterThanOperation(column, operand, variables, references);

    case SqlOperator.GreaterThanOrEqual:
      return getGreaterThanOrEqualOperation(column, operand, variables, references);

    case SqlOperator.LessThan:
      return getLessThanOperation(column, operand, variables, references);

    case SqlOperator.LessThanOrEqual:
      return getLessThanOrEqualOperation(column, operand, variables, references);

    case SqlOperator.IsIn:
      return getIsInOperation(column, operand, variables, references);

    case SqlOperator.IsBetween:
      return getIsBetweenOperation(column, operand, variables, references);

    case SqlOperator.StartsWith:
      return getStartsWithOperation(column, operand, variables, references);

    case SqlOperator.Contains:
      return getContainsOperation(column, operand, variables, references);
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

  const list = operand.map((current) => {
    return getOperandValue(current, values, references);
  });

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

  const [begin, end] = operand.map((current) => {
    return getOperandValue(current, values, references);
  });

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
  if (operand instanceof SqlRaw || operand instanceof SqlReference) {
    return operand.build();
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
