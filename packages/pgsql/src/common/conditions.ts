import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlOperationContext } from '../operations/types.js';
import type { SqlFilters } from './types.js';
import type { SqlSource } from './source.js';

import { isAnyObject, isEmptyObject } from '@ez4/utils';
import { isObjectSchema } from '@ez4/schema';

import { mergeSqlAlias, mergeSqlPath } from '../utils/merge.js';
import { InvalidOperandError, MissingOperatorError } from '../errors/operations.js';
import { SqlSelectStatement } from '../statements/select.js';
import { getIsNullOperation } from '../operations/is-null.js';
import { getExistsOperation } from '../operations/exists.js';
import { getEqualOperation } from '../operations/equal.js';
import { getNotEqualOperation } from '../operations/not-equal.js';
import { getGreaterThanOperation } from '../operations/greater.js';
import { getGreaterOrEqualOperation } from '../operations/greater-equal.js';
import { getLessThanOperation } from '../operations/less.js';
import { getLessOrEqualOperation } from '../operations/less-equal.js';
import { getIsInOperation } from '../operations/is-in.js';
import { getIsBetweenOperation } from '../operations/is-between.js';
import { getStartsWithOperation } from '../operations/starts-with.js';
import { getContainsOperation } from '../operations/contains.js';
import { SqlColumnReference } from './reference.js';
import { SqlOperator } from './types.js';
import { SqlRawValue } from './raw.js';

export class SqlConditions {
  #state: {
    source: SqlSource;
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    filters: SqlFilters;
  };

  constructor(source: SqlSource, references: SqlBuilderReferences, options: SqlBuilderOptions, filters: SqlFilters = {}) {
    this.#state = {
      source,
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

  build(): [string, unknown[]] | undefined {
    const { source, references, options, filters } = this.#state;

    const context = {
      variables: [],
      references,
      options,
      source
    };

    const operations = getFilterOperations(filters, source.schema, context);

    if (operations.length) {
      return [operations.join(' AND '), context.variables];
    }

    return undefined;
  }
}

const getFilterOperations = (filters: SqlFilters, schema: ObjectSchema | undefined, context: SqlOperationContext) => {
  const allOperations = [];

  for (const field in filters) {
    const value = filters[field];

    if (value === undefined) {
      continue;
    }

    const operation = getFieldOperation(field, value, schema, context);

    if (operation) {
      allOperations.push(operation);
    }
  }

  return allOperations;
};

const getFieldOperation = (
  field: string,
  value: unknown,
  schema: ObjectSchema | undefined,
  context: SqlOperationContext
): string | undefined => {
  const { source, parent } = context;

  switch (field) {
    case 'AND':
    case 'OR':
      return getLogicalOperations(field, value, schema, context);

    case 'NOT':
      return getNegateOperations(value, schema, context);

    default: {
      const columnName = mergeSqlPath(field, parent);
      const columnPath = parent ? columnName : mergeSqlAlias(columnName, source.alias);

      if (value === null) {
        return getIsNullOperation(columnPath, true);
      }

      if (value instanceof SqlSelectStatement) {
        return getExistsOperation(columnPath, value, context);
      }

      const columnSchema = schema?.properties[field];

      if (value instanceof SqlRawValue || value instanceof SqlColumnReference || !isAnyObject(value)) {
        return getEqualOperation(columnPath, columnSchema, value, context);
      }

      const { insensitive, ...valueOperation } = value;

      const operationEntries = Object.entries(valueOperation);

      if (operationEntries.length === 0) {
        throw new MissingOperatorError(columnName);
      }

      if (operationEntries.length === 1) {
        return getSingleOperation(columnPath, columnSchema, operationEntries[0], {
          ...context,
          insensitive
        });
      }

      const isNestedEntry = columnSchema && isObjectSchema(columnSchema);
      const nestedContext = { ...context, parent: columnPath };

      const allOperations = !isNestedEntry
        ? getMultipleOperations(columnPath, columnSchema, operationEntries, nestedContext)
        : getFilterOperations(valueOperation, columnSchema, nestedContext);

      if (allOperations.length) {
        return combineOperations(allOperations);
      }

      return undefined;
    }
  }
};

const getSingleOperation = (column: string, schema: AnySchema | undefined, operation: [string, unknown], context: SqlOperationContext) => {
  const finalOperation = getFinalOperation(column, schema, operation, context);

  if (!finalOperation) {
    const nestedSchema = schema && isObjectSchema(schema) ? schema : undefined;

    const allOperation = getFilterOperations({ [operation[0]]: operation[1] }, nestedSchema, {
      ...context,
      parent: column
    });

    if (allOperation.length) {
      return combineOperations(allOperation);
    }
  }

  return finalOperation;
};

const getMultipleOperations = (
  column: string,
  schema: AnySchema | undefined,
  entries: [string, unknown][],
  context: SqlOperationContext
) => {
  const allOperations = [];

  for (const operation of entries) {
    const finalOperation = getFinalOperation(column, schema, operation, context);

    if (finalOperation) {
      allOperations.push(finalOperation);
    }
  }

  return allOperations;
};

const getFinalOperation = (column: string, schema: AnySchema | undefined, operation: [string, unknown], context: SqlOperationContext) => {
  const [operator, operand] = operation;

  if (operand === undefined) {
    return undefined;
  }

  switch (operator) {
    case SqlOperator.IsNull:
    case SqlOperator.IsMissing:
      return getIsNullOperation(column, operand);

    case SqlOperator.Equal:
      return getEqualOperation(column, schema, operand, context);

    case SqlOperator.NotEqual:
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

const getNegateOperations = (value: unknown, schema: ObjectSchema | undefined, context: SqlOperationContext) => {
  if (!isAnyObject(value)) {
    throw new InvalidOperandError();
  }

  const allOperations = getFilterOperations(value, schema, context);

  if (allOperations.length) {
    return `NOT ${combineOperations(allOperations)}`;
  }

  return undefined;
};

const getLogicalOperations = (field: string, value: unknown, schema: ObjectSchema | undefined, context: SqlOperationContext) => {
  if (!Array.isArray(value)) {
    throw new InvalidOperandError();
  }

  const allOperations = [];

  for (const current of value) {
    if (field === 'AND') {
      allOperations.push(...getFilterOperations(current, schema, context));
      continue;
    }

    const operations = getFilterOperations(current, schema, context);

    if (operations.length) {
      allOperations.push(combineOperations(operations));
    }
  }

  if (allOperations.length) {
    return `(${allOperations.join(` ${field} `)})`;
  }

  return undefined;
};

const combineOperations = (operations: string[]) => {
  if (operations.length > 1) {
    return `(${operations.join(' AND ')})`;
  }

  return operations[0];
};
