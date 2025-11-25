import type { ArraySchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import { getIndentedOutput } from '../utils/format';
import { getCommonSchemaOutput } from '../utils/schema';
import { getAnySchemaOutput } from './any';

export const getArraySchemaOutput = (schema: ArraySchema) => {
  if (schema.definitions?.encoded) {
    return ['type: string', ...getCommonSchemaOutput(schema), 'format: byte'];
  }

  const output = ['type: array', ...getCommonSchemaOutput(schema)];

  if (schema.definitions) {
    const { minLength, maxLength } = schema.definitions;

    if (isAnyNumber(minLength)) {
      output.push(`minItems: ${minLength}`);
    }

    if (isAnyNumber(maxLength)) {
      output.push(`maxItems: ${maxLength}`);
    }
  }

  const schemaOutput = getAnySchemaOutput(schema.element);

  if (schemaOutput.length) {
    output.push('items:', ...getIndentedOutput(schemaOutput));
  } else {
    output.push('items: true');
  }

  return output;
};
