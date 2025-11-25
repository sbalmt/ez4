import type { StringSchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import { getCommonSchemaOutput } from '../utils/schema';
import { getMultilineOutput } from '../utils/format';

export const getStringSchemaOutput = (schema: StringSchema) => {
  const output = ['type: string', ...getCommonSchemaOutput(schema)];

  if (schema.format) {
    output.push(`format: ${schema.format}`);
  }

  if (schema.definitions) {
    const { default: defaultValue, minLength, maxLength, pattern, value } = schema.definitions;

    if (value) {
      output.push(`enum: ["${getMultilineOutput(value)}"]`);
    }

    if (defaultValue) {
      output.push(`default: "${getMultilineOutput(defaultValue)}"`);
    }

    if (pattern) {
      output.push(`pattern: "${pattern.replaceAll('\\', '\\\\')}"`);
    }

    if (isAnyNumber(minLength)) {
      output.push(`minLength: ${minLength}`);
    }

    if (isAnyNumber(maxLength)) {
      output.push(`maxLength: ${maxLength}`);
    }
  }

  return output;
};
