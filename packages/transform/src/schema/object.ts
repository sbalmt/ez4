import type { ObjectSchema } from '@ez4/schema';

import { getNewContext } from '../types/context.js';
import { transformAny } from './any.js';

export const transformObject = (
  value: unknown,
  schema: ObjectSchema,
  context = getNewContext()
) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const output: Record<string, unknown> = {};

  if (schema.identity) {
    context.references[schema.identity] = schema;
  }

  for (const property in schema.properties) {
    const valueSchema = schema.properties[property];

    const rawValue = (value as any)[property];
    const newValue = transformAny(rawValue, valueSchema, context);

    if (newValue !== undefined) {
      output[property] = newValue;
    }
  }

  return output;
};
