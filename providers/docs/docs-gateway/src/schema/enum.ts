import type { EnumSchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import { getIndentedOutput, getMultilineOutput } from '../utils/format';

export const getEnumSchemaOutput = (schema: EnumSchema) => {
  const optionsOutput = [];

  for (const option of schema.options) {
    if (!isAnyNumber(option.value)) {
      optionsOutput.push(`- '${getMultilineOutput(option.value)}'`);
    } else {
      optionsOutput.push(`- ${option.value}`);
    }
  }

  return ['enum: ', ...getIndentedOutput(optionsOutput)];
};
