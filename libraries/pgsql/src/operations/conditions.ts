import type { AnySchema } from '@ez4/schema';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder';
import type { SqlOperationContext } from './types';
import type { SqlFilters } from '../common/types';
import type { SqlSource } from '../common/source';

import { getSchemaProperty, isObjectSchema } from '@ez4/schema';
import { isAnyObject, isEmptyObject } from '@ez4/utils';

import { mergeSqlAlias, mergeSqlPath } from '../utils/merge';
import { SqlSelectStatement } from '../statements/select';
import { getIsNullOperation } from './is-null';
import { getExistsOperation } from './exists';
import { getEqualOperation } from './equal';
import { getNotEqualOperation } from './not-equal';
import { getGreaterThanOperation } from './greater';
import { getGreaterOrEqualOperation } from './greater-equal';
import { getLessThanOperation } from './less';
import { getLessOrEqualOperation } from './less-equal';
import { getIsInOperation } from './is-in';
import { getIsBetweenOperation } from './is-between';
import { getStartsWithOperation } from './starts-with';
import { getContainsOperation } from './contains';
import { SqlColumnReference } from '../common/reference';
import { SqlOperator } from '../common/types';
import { SqlRawValue } from '../common/raw';

import { InvalidOperandError, MissingOperatorError } from './errors';

export class SqlConditions {
  #state: {
    source?: SqlSource;
    references?: SqlBuilderReferences;
    options: SqlBuilderOptions;
    filters: SqlFilters;
  };

  constructor(
    source: SqlSource | undefined,
    references: SqlBuilderReferences | undefined,
    options: SqlBuilderOptions,
    filters: SqlFilters = {}
  ) {
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

    const operations = getFilterOperations(filters, source?.schema, context);

    if (operations.length) {
      return [operations.join(' AND '), context.variables];
    }

    return undefined;
  }
}

const getFilterOperations = (filters: SqlFilters, schema: AnySchema | undefined, context: SqlOperationContext) => {
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
  schema: AnySchema | undefined,
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
      const columnPath = parent ? columnName : mergeSqlAlias(columnName, source?.alias);

      if (value === null) {
        return getIsNullOperation(columnPath, true);
      }

      if (value instanceof SqlSelectStatement) {
        return getExistsOperation(columnPath, value, context);
      }

      const columnSchema = schema ? getSchemaProperty(schema, field) : undefined;

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
    const allOperation = getFilterOperations({ [operation[0]]: operation[1] }, schema, {
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

const getNegateOperations = (value: unknown, schema: AnySchema | undefined, context: SqlOperationContext) => {
  if (!isAnyObject(value)) {
    throw new InvalidOperandError();
  }

  const allOperations = getFilterOperations(value, schema, context);

  if (allOperations.length) {
    return `NOT ${combineOperations(allOperations)}`;
  }

  return undefined;
};

const getLogicalOperations = (field: string, value: unknown, schema: AnySchema | undefined, context: SqlOperationContext) => {
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
