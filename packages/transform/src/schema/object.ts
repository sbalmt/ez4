import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isAnyObject } from '@ez4/utils';

import { createTransformContext } from '../types/context.js';
import { transformAny } from './any.js';

export const transformObject = (value: unknown, schema: ObjectSchema, context = createTransformContext()) => {
  if (value === null || value === undefined || !isAnyObject(value)) {
    return schema.definitions?.default;
  }

  const output: AnyObject = {};

  if (schema.identity) {
    context.references[schema.identity] = schema;
  }

  for (const property in schema.properties) {
    const valueSchema = schema.properties[property];

    const rawValue = value[property];
    const newValue = transformAny(rawValue, valueSchema, context);

    if (newValue !== undefined) {
      output[property] = newValue;
    }
  }

  return output;
};
