import type { NumberSchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import { getCommonSchemaOutput } from '../utils/schema';

export const getNumberSchemaOutput = (schema: NumberSchema) => {
  const output = [`type: ${schema.format === 'integer' ? 'integer' : 'number'}`];

  output.push(...getCommonSchemaOutput(schema));

  if (schema.definitions) {
    const { default: defaultValue, minValue, maxValue, value } = schema.definitions;

    if (isAnyNumber(defaultValue)) {
      output.push(`default: ${defaultValue}`);
    }

    if (isAnyNumber(minValue)) {
      output.push(`minimum: ${minValue}`);
    }

    if (isAnyNumber(maxValue)) {
      output.push(`maximum: ${maxValue}`);
    }

    if (isAnyNumber(value)) {
      output.push(`enum: [${value}]`);
    }
  }

  return output;
};
