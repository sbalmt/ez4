import type { ObjectSchema } from '@ez4/schema';

import { transformAny } from './any.js';

export const transformObject = (value: unknown, schema: ObjectSchema) => {
  const output: Record<string, unknown> = {};

  for (const property in schema.properties) {
    const valueSchema = schema.properties[property];
    const objectValue = (value as any)[property];

    output[property] = transformAny(objectValue, valueSchema);
  }

  return output;
};
