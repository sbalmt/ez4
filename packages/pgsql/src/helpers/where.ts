import type { Query } from '@ez4/database';
import type { SqlBuilderReferences, SqlStatementRecord } from '../types.js';

import { isAnyObject } from '@ez4/utils';

import { SqlOperator } from '../types.js';
import { escapeName } from '../utils.js';

import {
  InvalidOperandError,
  MissingOperatorsError,
  TooManyOperatorsError
} from '../errors/operation.js';

type SqlBuildContext = {
  parent?: string;
  references: SqlBuilderReferences;
};

export type SqlWhereFilters = Query.WhereFields<SqlStatementRecord, {}>;

export type SqlWhereState = {
  references: SqlBuilderReferences;
  filters: SqlWhereFilters;
};

export class SqlWhereClause {
  #state: SqlWhereState;

  constructor(state: SqlWhereState) {
    this.#state = state;
  }

  filter(filters: SqlWhereFilters) {
    this.#state.filters = filters;

    return this;
  }

  toString() {
    const { references, filters } = this.#state;

    const operations = getOperations(filters, {
      references
    });

    return `WHERE ${operations.join(' AND ')}`;
  }
}

const getOperations = (filters: SqlWhereFilters, context: SqlBuildContext) => {
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
  context: SqlBuildContext
): string | undefined => {
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
      const column = getColumnName(field, context);

      if (value === null) {
        return getValueOperation(column, SqlOperator.IsNull, true, context);
      }

      if (isAnyObject(value)) {
        const [entry, ...rest] = Object.entries(value);

        if (!entry) {
          throw new MissingOperatorsError(column);
        }

        if (rest.length) {
          throw new TooManyOperatorsError(column);
        }

        const [operator, operand] = entry;

        const operation = getValueOperation(column, operator, operand, context);

        if (!operation) {
          return combineOperations(getOperations(value, { ...context, parent: column }));
        }

        return operation;
      }

      return getValueOperation(column, SqlOperator.Equal, value, context);
    }
  }

  return undefined;
};

const getValueOperation = (
  column: string,
  operator: string,
  operand: unknown,
  { references }: SqlBuildContext
) => {
  switch (operator) {
    case SqlOperator.Equal:
      return `${column} = :${references.counter++}`;

    case SqlOperator.Not:
      return `${column} != :${references.counter++}`;

    case SqlOperator.GreaterThan:
      return `${column} > :${references.counter++}`;

    case SqlOperator.GreaterThanOrEqual:
      return `${column} >= :${references.counter++}`;

    case SqlOperator.LessThan:
      return `${column} < :${references.counter++}`;

    case SqlOperator.LessThanOrEqual:
      return `${column} <= :${references.counter++}`;

    case SqlOperator.IsIn:
      if (!Array.isArray(operand)) {
        throw new InvalidOperandError(column);
      }

      return `${column} IN (${operand.map(() => `:${references.counter++}`).join(', ')})`;

    case SqlOperator.IsBetween:
      if (!Array.isArray(operand)) {
        throw new InvalidOperandError(column);
      }

      return `${column} BETWEEN :${references.counter++} AND :${references.counter++}`;

    case SqlOperator.IsMissing:
    case SqlOperator.IsNull:
      return `${column} IS ${operand ? 'NULL' : 'NOT NULL'}`;

    case SqlOperator.StartsWith:
      return `${column} LIKE :${references.counter++} || '%'`;

    case SqlOperator.Contains:
      return `${column} LIKE '%' || :${references.counter++} || '%'`;
  }

  return undefined;
};

const combineOperations = (operations: string[]) => {
  if (operations.length > 1) {
    return `(${operations.join(' AND ')})`;
  }

  return operations[0];
};

const getColumnName = (field: string, context: SqlBuildContext) => {
  const { parent, references } = context;
  const { alias } = references;

  if (alias && parent) {
    return `${escapeName(alias)}.${parent}['${field}']`;
  }

  if (alias) {
    return `${escapeName(alias)}.${escapeName(field)}`;
  }

  if (parent) {
    return `${parent}['${field}']`;
  }

  return escapeName(field);
};
