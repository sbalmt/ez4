import type { AnySchema, NamingStyle } from '@ez4/schema';

import { getIndentedOutput } from '../utils/format';
import { getAnySchemaOutput } from '../schema/any';

export const getSchemaOutput = (schema: AnySchema, namingStyle?: NamingStyle) => {
  const schemaOutput = getAnySchemaOutput(schema, namingStyle);

  if (schemaOutput.length) {
    return ['schema:', ...getIndentedOutput(schemaOutput)];
  }

  return [`schema: true`];
};
