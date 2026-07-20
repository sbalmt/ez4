import type { AnySchema, ObjectSchema, UnionSchema } from '@ez4/schema';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder';
import type { SqlSource } from '../common/source';
import type { SqlRecord } from '../common/types';

import { getSchemaProperty, isNullishSchema, isObjectSchema, isUnionSchema, SchemaType } from '@ez4/schema';
import { isPlainObject } from '@ez4/utils';

import { SqlRaw, SqlRawOperation } from '../common/raw';
import { InvalidAtomicOperation } from '../operations/errors';
import { mergeSqlAlias, mergeSqlJsonPath, mergeSqlPath } from '../utils/merge';
import { SqlSelectStatement } from '../statements/select';
import { SqlColumnReference } from '../common/reference';

export type SqlUpdateContext = {
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  variables: unknown[];
  coalesce?: boolean;
  parent?: string;
  inner?: boolean;
};

export const getUpdateColumns = (
  source: SqlSource,
  record: SqlRecord,
  schema: ObjectSchema | UnionSchema | undefined,
  context: SqlUpdateContext
): string[] => {
  const { variables, references, options, coalesce, parent, inner } = context;

  const columns = [];

  const pushUpdate = (fieldName: string, fieldValue: string) => {
    if (!inner) {
      columns.push(`${mergeSqlPath(fieldName, parent)} = ${fieldValue}`);
    } else {
      columns.push(`'${fieldName}', ${fieldValue}`);
    }
  };

  const json = !!parent;

  for (const fieldName in record) {
    const value = record[fieldName];

    if (value === undefined) {
      continue;
    }

    if (value === null && !json) {
      pushUpdate(fieldName, 'null');
      continue;
    }

    if (value instanceof SqlColumnReference) {
      pushUpdate(fieldName, value.build());
      continue;
    }

    if (value instanceof SqlSelectStatement) {
      const [selectStatement, selectVariables] = value.build();

      pushUpdate(fieldName, `(${selectStatement})`);
      variables.push(...selectVariables);

      continue;
    }

    const fieldSchema = schema && getSchemaProperty(schema, fieldName);

    if (isPlainObject(value)) {
      const nextSchema = fieldSchema && (isObjectSchema(fieldSchema) || isUnionSchema(fieldSchema)) ? fieldSchema : undefined;
      const columnName = mergeSqlPath(fieldName, parent);

      const shouldMerge = nextSchema && isNullishSchema(nextSchema);

      const jsonValue = getUpdateColumns(source, value, nextSchema, {
        ...context,
        coalesce: shouldMerge,
        parent: columnName,
        inner: true
      });

      if (shouldMerge || inner) {
        const additions = jsonValue.filter((value) => !value.startsWith('#-'));
        const removals = jsonValue.filter((value) => value.startsWith('#-'));

        if (shouldMerge) {
          const columnPath = mergeSqlAlias(columnName, source.alias);
          const changes = [`COALESCE(${columnPath}, '{}'::jsonb)`];

          if (removals.length) {
            changes.push(removals.join(' '));
          }

          if (additions.length) {
            changes.push(`|| jsonb_build_object(${additions.join(', ')})`);
          }

          pushUpdate(fieldName, changes.join(' '));
          continue;
        }

        if (inner) {
          const changes = [];

          if (removals.length) {
            changes.push(removals.join(' '));
          }

          if (additions.length) {
            changes.push(`jsonb_build_object(${additions.join(', ')})`);
          }

          pushUpdate(fieldName, changes.join(' || '));
          continue;
        }
      }

      columns.push(...jsonValue);
      continue;
    }

    const fieldIndex = references.counter++;

    if (!(value instanceof SqlRawOperation)) {
      pushUpdate(fieldName, `:${fieldIndex}`);
    } else if (isJsonRemoveOperator(value.operator)) {
      columns.push(`${value.operator} '${value.build()}'`);
      continue;
    } else {
      const columnName = mergeSqlJsonPath(fieldName, parent, true);
      const columnPath = mergeSqlAlias(columnName, source.alias);

      if (!json) {
        pushUpdate(fieldName, `(${columnPath} ${value.operator} :${fieldIndex})`);
      } else {
        const lhsOperand = getOperandColumn(fieldSchema, fieldName, coalesce ? getOperandCoalesce(fieldSchema, columnPath) : columnPath);
        const rhsOperand = getOperandColumn(fieldSchema, fieldName, `:${fieldIndex}`);

        pushUpdate(fieldName, `(${lhsOperand} ${value.operator} ${rhsOperand})::text::jsonb`);
      }
    }

    const fieldValue = value instanceof SqlRaw ? value.build(source) : value;

    if (options.onPrepareVariable) {
      variables.push(options.onPrepareVariable(fieldValue, { schema: fieldSchema, index: fieldIndex, json }));
      continue;
    }

    variables.push(fieldValue);
  }

  return columns;
};

const isJsonRemoveOperator = (operand: string) => {
  return operand === '#-';
};

const getOperandColumn = (schema: AnySchema | undefined, fieldName: string, fieldExpression: string) => {
  if (schema?.type !== SchemaType.Number) {
    throw new InvalidAtomicOperation(fieldName);
  }

  if (schema.format === 'integer') {
    return `(${fieldExpression})::int`;
  }

  return `(${fieldExpression})::dec`;
};

const getOperandCoalesce = (schema: AnySchema | undefined, columnName: string) => {
  if (schema?.type === SchemaType.Number) {
    const defaultValue = schema.definitions?.value ?? schema.definitions?.default ?? schema.definitions?.minValue ?? 0;

    return `COALESCE(${columnName}, '${defaultValue}')`;
  }

  return columnName;
};
