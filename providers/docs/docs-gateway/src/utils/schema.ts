import type { AnySchema, ReferenceSchema } from '@ez4/schema';

import { getMultilineOutput } from '../utils/format';

export const getCommonSchemaOutput = (schema: Exclude<AnySchema, ReferenceSchema>) => {
  const output = [];

  if (schema.description) {
    output.push(`description: "${getMultilineOutput(schema.description)}"`);
  }

  return output;
};
