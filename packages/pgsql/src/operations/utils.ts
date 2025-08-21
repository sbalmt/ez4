import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types.js';

import { SchemaType } from '@ez4/schema';

import { SqlColumnReference } from '../common/reference.js';
import { SqlRawValue } from '../common/raw.js';
import { escapeSqlData } from '../main.js';

export const getOperandValue = (schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext, encode?: boolean) => {
  const { source, variables, references, options, parent } = context;

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
    json: encode && !!parent,
    schema,
    index
  });

  variables.push(preparedValue);

  return field;
};

export const getOperandColumn = (schema: AnySchema | undefined, column: string, context: SqlOperationContext) => {
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
