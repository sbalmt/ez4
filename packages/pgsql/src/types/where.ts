import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlStatement } from './statement.js';
import type { SqlFilters } from './common.js';

import { isAnyObject, isEmptyObject } from '@ez4/utils';
import { isObjectSchema } from '@ez4/schema';

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
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  statement: SqlStatement;
  variables: unknown[];
  parent?: string;
};

export class SqlWhereClause {
  #state: {
    statement: SqlStatement;
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    filters: SqlFilters;
  };

  constructor(
    statement: SqlStatement,
    references: SqlBuilderReferences,
    options: SqlBuilderOptions,
    filters: SqlFilters = {}
  ) {
    this.#state = {
      statement,
      references,
      options,
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
    const { statement, references, options, filters } = this.#state;

    const context = {
      variables: [],
      statement,
      references,
      options
    };

    const operations = getOperations(filters, statement.schema, context);

    const clause = `WHERE ${operations.join(' AND ')}`;

    return [clause, context.variables];
  }
}

const getOperations = (
  filters: SqlFilters,
  schema: ObjectSchema | undefined,
  context: SqlWhereContext
) => {
  const operations = [];

  for (const field in filters) {
    const value = filters[field];

    if (value === undefined) {
      continue;
    }

    const operation = getFieldOperation(field, value, schema, context);

    if (operation) {
      operations.push(operation);
    }
  }

  return operations;
};

const getFieldOperation = (
  field: string,
  value: unknown,
  schema: ObjectSchema | undefined,
  context: SqlWhereContext
): string | undefined => {
  const { statement, parent } = context;

  switch (field) {
    case 'NOT': {
      if (Array.isArray(value) || !isAnyObject(value)) {
        throw new InvalidOperandError();
      }

      const operations = getOperations(value, schema, context);

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
          operations.push(combineOperations(getOperations(current, schema, context)));
        } else {
          operations.push(...getOperations(current, schema, context));
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

      const columnSchema = schema?.properties[field];

      if (value instanceof SqlRaw || value instanceof SqlReference || !isAnyObject(value)) {
        return getEqualOperation(columnPath, columnSchema, value, context);
      }

      const [entry, ...rest] = Object.entries(value);

      if (!entry) {
        throw new MissingOperatorError(columnName);
      }

      if (rest.length > 0) {
        throw new TooManyOperatorsError(columnName);
      }

      const [operator, operand] = entry;

      const operation = getValueOperation(columnPath, columnSchema, operator, operand, context);

      if (operation) {
        return operation;
      }

      const nextSchema = columnSchema && isObjectSchema(columnSchema) ? columnSchema : undefined;

      return combineOperations(
        getOperations(value, nextSchema, {
          ...context,
          parent: columnName
        })
      );
    }
  }

  return undefined;
};

const getValueOperation = (
  column: string,
  schema: AnySchema | undefined,
  operator: string,
  operand: unknown,
  context: SqlWhereContext
) => {
  switch (operator) {
    case SqlOperator.IsNull:
    case SqlOperator.IsMissing:
      return getNullableOperation(column, operand);

    case SqlOperator.Equal:
      return getEqualOperation(column, schema, operand, context);

    case SqlOperator.Not:
      return getNotEqualOperation(column, schema, operand, context);

    case SqlOperator.GreaterThan:
      return getGreaterThanOperation(column, schema, operand, context);

    case SqlOperator.GreaterThanOrEqual:
      return getGreaterOrEqualOperation(column, schema, operand, context);

    case SqlOperator.LessThan:
      return getLessThanOperation(column, schema, operand, context);

    case SqlOperator.LessThanOrEqual:
      return getLessOrEqualOperation(column, schema, operand, context);

    case SqlOperator.IsIn:
      return getIsInOperation(column, schema, operand, context);

    case SqlOperator.IsBetween:
      return getIsBetweenOperation(column, schema, operand, context);

    case SqlOperator.StartsWith:
      return getStartsWithOperation(column, schema, operand, context);

    case SqlOperator.Contains:
      return getContainsOperation(column, schema, operand, context);
  }

  return undefined;
};

const getNullableOperation = (column: string, value: unknown) => {
  return `${column} IS ${value ? 'NULL' : 'NOT NULL'}`;
};

const getEqualOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  return `${column} = ${getOperandValue(schema, operand, context)}`;
};

const getNotEqualOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  return `${column} != ${getOperandValue(schema, operand, context)}`;
};

const getGreaterThanOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  return `${column} > ${getOperandValue(schema, operand, context)}`;
};

const getGreaterOrEqualOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  return `${column} >= ${getOperandValue(schema, operand, context)}`;
};

const getLessThanOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  return `${column} < ${getOperandValue(schema, operand, context)}`;
};

const getLessOrEqualOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  return `${column} <= ${getOperandValue(schema, operand, context)}`;
};

const getIsInOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  if (!Array.isArray(operand)) {
    throw new InvalidOperandError(column);
  }

  const list = operand.map((current) => {
    return getOperandValue(schema, current, context);
  });

  return `${column} IN (${list.join(', ')})`;
};

const getIsBetweenOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  if (!Array.isArray(operand)) {
    throw new InvalidOperandError(column);
  }

  const [begin, end] = operand.map((current) => {
    return getOperandValue(schema, current, context);
  });

  return `${column} BETWEEN ${begin} AND ${end}`;
};

const getStartsWithOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  return `${column} LIKE ${getOperandValue(schema, operand, context)} || '%'`;
};

const getContainsOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  return `${column} LIKE '%' || ${getOperandValue(schema, operand, context)} || '%'`;
};

const getOperandValue = (
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlWhereContext
) => {
  const { variables, references, options } = context;

  if (operand instanceof SqlRaw || operand instanceof SqlReference) {
    return operand.build();
  }

  const index = references.counter++;

  if (options.onPrepareVariable) {
    variables.push(options.onPrepareVariable(operand, index, schema));
  } else {
    variables.push(operand);
  }

  return `:${index}`;
};

const combineOperations = (operations: string[]) => {
  if (operations.length > 1) {
    return `(${operations.join(' AND ')})`;
  }

  return operations[0];
};
