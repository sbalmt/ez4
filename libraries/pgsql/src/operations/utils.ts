import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { SchemaType } from '@ez4/schema';

import { SqlColumnReference } from '../common/reference';
import { SqlRawValue } from '../common/raw';
import { escapeSqlData } from '../main';

export const getOperandValue = (schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext, encode?: boolean) => {
  const { source, variables, references, options, path } = context;

  if (operand instanceof SqlColumnReference) {
    return operand.build();
  }

  if (operand instanceof SqlRawValue) {
    return operand.build(source);
  }

  if (!references) {
    return escapeSqlData(operand);
  }

  const index = references.counter++;
  const field = `:${index}`;

  if (!options.onPrepareVariable) {
    return (variables.push(operand), field);
  }

  const preparedValue = options.onPrepareVariable(operand, {
    json: encode && !!path,
    schema,
    index
  });

  variables.push(preparedValue);

  return field;
};

export const getOperandColumn = (schema: AnySchema | undefined, column: string, context: SqlOperationContext) => {
  const isJsonColumn = !!context.path;

  if (!isJsonColumn) {
    return column;
  }

  switch (schema?.type) {
    case SchemaType.Boolean: {
      return `(${column})::bool`;
    }

    case SchemaType.Number: {
      if (schema.format === 'integer') {
        return `(${column})::int`;
      }

      return `(${column})::dec`;
    }

    case SchemaType.String: {
      if (schema.format === 'date-time') {
        return `(${column})::timestamptz`;
      }

      if (schema.format === 'date') {
        return `(${column})::date`;
      }

      if (schema.format === 'time') {
        return `(${column})::time`;
      }

      break;
    }
  }

  return column;
};
