import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlSource } from '../common/source.js';
import type { SqlRecord } from '../common/types.js';

import { isDynamicObjectSchema, IsNullishSchema, isObjectSchema, SchemaType } from '@ez4/schema';
import { isPlainObject } from '@ez4/utils';

import { SqlRaw, SqlRawOperation } from '../common/raw.js';
import { SqlSelectStatement } from '../statements/select.js';
import { mergeSqlJsonPath, mergeSqlPath } from '../utils/merge.js';
import { InvalidAtomicOperation } from '../errors/operation.js';
import { SqlColumnReference } from '../common/reference.js';

export type SqlUpdateContext = {
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  variables: unknown[];
  coalesce?: boolean;
  parent?: string;
};

export const getUpdateColumns = (
  source: SqlSource,
  record: SqlRecord,
  schema: ObjectSchema | undefined,
  context: SqlUpdateContext
): string[] => {
  const { variables, references, options, coalesce, parent } = context;

  const columns = [];

  const pushUpdate = (fieldName: string, fieldValue: string) => {
    if (!coalesce) {
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

    const fieldSchema = schema?.properties[fieldName];

    if (isPlainObject(value)) {
      const nextSchema = fieldSchema && isObjectSchema(fieldSchema) ? fieldSchema : undefined;
      const canReplace = nextSchema && isDynamicObjectSchema(nextSchema);

      if (canReplace) {
        const fieldIndex = references.counter++;

        if (options.onPrepareVariable) {
          variables.push(options.onPrepareVariable(value, { schema: nextSchema, index: fieldIndex, json: true }));
        } else {
          variables.push(value);
        }

        pushUpdate(fieldName, `:${fieldIndex}`);
        continue;
      }

      const canCombine = nextSchema && IsNullishSchema(nextSchema);
      const columnName = mergeSqlPath(fieldName, parent);

      const jsonValue = getUpdateColumns(source, value, nextSchema, {
        ...context,
        coalesce: canCombine,
        parent: columnName
      });

      if (canCombine) {
        columns.push(`${columnName} = COALESCE(${columnName}, '{}'::jsonb) || jsonb_build_object(${jsonValue.join(',')})`);
      } else {
        columns.push(...jsonValue);
      }

      continue;
    }

    const fieldValue = value instanceof SqlRaw ? value.build(source) : value;
    const fieldIndex = references.counter++;

    if (!(value instanceof SqlRawOperation)) {
      pushUpdate(fieldName, `:${fieldIndex}`);
    } else {
      const columnName = mergeSqlJsonPath(fieldName, parent);

      if (!json) {
        pushUpdate(fieldName, `(${columnName} ${value.operator} :${fieldIndex})`);
      } else {
        const lhsOperand = getOperandColumn(fieldSchema, fieldName, coalesce ? getOperandCoalesce(fieldSchema, columnName) : columnName);
        const rhsOperand = getOperandColumn(fieldSchema, fieldName, `:${fieldIndex}`);

        pushUpdate(fieldName, `(${lhsOperand} ${value.operator} ${rhsOperand})::text::jsonb`);
      }
    }

    if (options.onPrepareVariable) {
      variables.push(options.onPrepareVariable(fieldValue, { schema: fieldSchema, index: fieldIndex, json }));
      continue;
    }

    variables.push(fieldValue);
  }

  return columns;
};

const getOperandColumn = (schema: AnySchema | undefined, fieldName: string, fieldExpression: string) => {
  if (schema?.type !== SchemaType.Number) {
    throw new InvalidAtomicOperation(fieldName);
  }

  if (schema.format === 'decimal') {
    return `(${fieldExpression})::dec`;
  }

  return `(${fieldExpression})::int`;
};

const getOperandCoalesce = (schema: AnySchema | undefined, columnName: string) => {
  if (schema?.type === SchemaType.Number) {
    const defaultValue = schema.definitions?.value ?? schema.definitions?.default ?? schema.definitions?.minValue ?? 0;

    return `COALESCE(${columnName}, '${defaultValue}')`;
  }

  return columnName;
};
