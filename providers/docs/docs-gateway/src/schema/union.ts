import type { NamingStyle, UnionSchema } from '@ez4/schema';

import { getIndentedOutput } from '../utils/format';
import { getAnySchemaOutput } from './any';

export const getUnionSchemaOutput = (schema: UnionSchema, namingStyle?: NamingStyle) => {
  const elementsOutput = [];

  for (const element of schema.elements) {
    const schemaOutput = getAnySchemaOutput(element, namingStyle);

    if (schemaOutput.length) {
      elementsOutput.push(`- ${schemaOutput.shift()}`, ...getIndentedOutput(schemaOutput));
    }
  }

  return ['anyOf:', ...elementsOutput];
};
