import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlSource } from './source.js';
import type { SqlFilters } from './common.js';

import { isObjectSchema, SchemaType } from '@ez4/schema';
import { isAnyObject, isEmptyObject } from '@ez4/utils';

import { mergeSqlAlias, mergeSqlPath } from '../utils/merge.js';
import { InvalidOperandError, MissingOperatorError, TooManyOperatorsError } from '../errors/operation.js';
import { SqlSelectStatement } from '../queries/select.js';
import { SqlColumnReference } from './reference.js';
import { SqlOperator } from './common.js';
import { SqlRawValue } from './raw.js';

type SqlConditionsContext = {
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  insensitive?: boolean;
  source: SqlSource;
  variables: unknown[];
  parent?: string;
};

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

    const operations = getOperations(filters, source.schema, context);

    if (operations.length) {
      return [operations.join(' AND '), context.variables];
    }

    return undefined;
  }
}

const getOperations = (filters: SqlFilters, schema: ObjectSchema | undefined, context: SqlConditionsContext) => {
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
  context: SqlConditionsContext
): string | undefined => {
  const { source, parent } = context;

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
      const columnPath = mergeSqlAlias(columnName, source.alias);

      if (value === null) {
        return getNullableOperation(columnPath, true);
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

      if (!operationEntries.length) {
        throw new MissingOperatorError(columnName);
      }

      const isNestedEntry = columnSchema && isObjectSchema(columnSchema);

      if (operationEntries.length > 1) {
        if (!isNestedEntry) {
          throw new TooManyOperatorsError(columnName);
        }

        const multipleOperations = getOperations(value, columnSchema, {
          ...context,
          parent: columnName,
          insensitive
        });

        return combineOperations(multipleOperations);
      }

      const [[operator, operand]] = operationEntries;

      const singleOperation = getValueOperation(columnPath, columnSchema, operator, operand, {
        ...context,
        insensitive
      });

      if (!singleOperation) {
        const operationSchema = isNestedEntry ? columnSchema : undefined;

        const multipleOperations = getOperations(value, operationSchema, {
          ...context,
          parent: columnName,
          insensitive
        });

        return combineOperations(multipleOperations);
      }

      return singleOperation;
    }
  }

  return undefined;
};

const getValueOperation = (
  column: string,
  schema: AnySchema | undefined,
  operator: string,
  operand: unknown,
  context: SqlConditionsContext
) => {
  switch (operator) {
    case SqlOperator.IsNull:
    case SqlOperator.IsMissing:
      return getNullableOperation(column, operand);

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

const getExistsOperation = (column: string, operand: unknown, context: SqlConditionsContext) => {
  if (!(operand instanceof SqlSelectStatement)) {
    throw new InvalidOperandError(column);
  }

  const [statement, variables] = operand.build();

  context.variables.push(...variables);

  return `EXISTS (${statement})`;
};

const getNullableOperation = (column: string, value: unknown) => {
  return `${column} IS ${value ? 'null' : 'NOT null'}`;
};

const getEqualOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  const rhsOperand = getOperandValue(schema, operand, context);
  const lhsOperand = getOperandColumn(schema, column, context);

  return `${lhsOperand} = ${rhsOperand}`;
};

const getNotEqualOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  const rhsOperand = getOperandValue(schema, operand, context);
  const lhsOperand = getOperandColumn(schema, column, context);

  return `${lhsOperand} != ${rhsOperand}`;
};

const getGreaterThanOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  const rhsOperand = getOperandValue(schema, operand, context);
  const lhsOperand = getOperandColumn(schema, column, context);

  return `${lhsOperand} > ${rhsOperand}`;
};

const getGreaterOrEqualOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  const rhsOperand = getOperandValue(schema, operand, context);
  const lhsOperand = getOperandColumn(schema, column, context);

  return `${lhsOperand} >= ${rhsOperand}`;
};

const getLessThanOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  const rhsOperand = getOperandValue(schema, operand, context);
  const lhsOperand = getOperandColumn(schema, column, context);

  return `${lhsOperand} < ${rhsOperand}`;
};

const getLessOrEqualOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  const rhsOperand = getOperandValue(schema, operand, context);
  const lhsOperand = getOperandColumn(schema, column, context);

  return `${lhsOperand} <= ${rhsOperand}`;
};

const getIsInOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  switch (schema?.type) {
    case SchemaType.Object:
    case SchemaType.Array:
    case SchemaType.Tuple:
      return `${column} <@ ${getOperandValue(schema, operand, context, true)}`;

    default:
      if (!Array.isArray(operand)) {
        throw new InvalidOperandError(column);
      }

      if (!operand.length) {
        return 'false';
      }

      const rhsOperand = operand.map((current) => getOperandValue(schema, current, context));
      const lhsOperand = getOperandColumn(schema, column, context);

      return `${lhsOperand} IN (${rhsOperand.join(', ')})`;
  }
};

const getIsBetweenOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  if (!Array.isArray(operand)) {
    throw new InvalidOperandError(column);
  }

  const [begin, end] = operand.map((current) => getOperandValue(schema, current, context));
  const lhsOperand = getOperandColumn(schema, column, context);

  return `${lhsOperand} BETWEEN ${begin} AND ${end}`;
};

const getStartsWithOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  const rhsOperand = getOperandValue(schema, operand, context);
  const lhsOperand = getOperandColumn(schema, column, context);

  if (context.insensitive) {
    return `${lhsOperand} ILIKE ${rhsOperand} || '%'`;
  }

  return `${lhsOperand} LIKE ${rhsOperand} || '%'`;
};

const getContainsOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext) => {
  switch (schema?.type) {
    case SchemaType.Object:
    case SchemaType.Array:
    case SchemaType.Tuple:
      return `${column} @> ${getOperandValue(schema, operand, context, true)}`;

    default: {
      const rhsOperand = getOperandValue(schema, operand, context);
      const lhsOperand = getOperandColumn(schema, column, context);

      if (context.insensitive) {
        return `${lhsOperand} ILIKE '%' || ${rhsOperand} || '%'`;
      }

      return `${lhsOperand} LIKE '%' || ${rhsOperand} || '%'`;
    }
  }
};

const getOperandValue = (schema: AnySchema | undefined, operand: unknown, context: SqlConditionsContext, encode?: boolean) => {
  const { source, variables, references, options, parent } = context;

  if (operand instanceof SqlColumnReference) {
    return operand.build();
  }

  if (operand instanceof SqlRawValue) {
    return operand.build(source);
  }

  const index = references.counter++;
  const field = `:${index}`;

  if (!options.onPrepareVariable) {
    return variables.push(operand), field;
  }

  const preparedValue = options.onPrepareVariable(operand, {
    json: encode && !!parent,
    schema,
    index
  });

  variables.push(preparedValue);

  return field;
};

const getOperandColumn = (schema: AnySchema | undefined, column: string, context: SqlConditionsContext) => {
  const json = !!context.parent;

  if (!json) {
    return column;
  }

  switch (schema?.type) {
    case SchemaType.Boolean:
      return `${column}::bool`;

    case SchemaType.Enum:
    case SchemaType.String:
      return `trim('"' from ${column}::text)`;

    case SchemaType.Number: {
      if (schema.format === 'decimal') {
        return `${column}::dec`;
      }

      return `${column}::int`;
    }
  }

  return column;
};

const combineOperations = (operations: string[]) => {
  if (operations.length > 1) {
    return `(${operations.join(' AND ')})`;
  }

  return operations[0];
};
