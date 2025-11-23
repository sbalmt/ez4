import type { NamingStyle, TupleSchema } from '@ez4/schema';

import { getIndentedOutput } from '../utils/format';
import { getCommonSchemaOutput } from '../utils/schema';
import { getAnySchemaOutput } from './any';

export const getTupleSchemaOutput = (schema: TupleSchema, namingStyle?: NamingStyle) => {
  const output = ['type: array', ...getCommonSchemaOutput(schema), 'items: false'];

  const elementsOutput = [];

  for (const element of schema.elements) {
    const schemaOutput = getAnySchemaOutput(element, namingStyle);

    if (schemaOutput.length) {
      elementsOutput.push(`- ${schemaOutput.shift()}`, ...getIndentedOutput(schemaOutput));
    }
  }

  if (elementsOutput.length) {
    output.push('prefixItems:', ...getIndentedOutput(elementsOutput));
  }

  return output;
};
