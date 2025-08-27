import type { ArraySchema } from '@ez4/schema';

import { tryDecodeBase64Json } from '../utils/base64.js';
import { createTransformContext } from '../types/context.js';
import { stringToArray } from '../utils/array.js';
import { transformAny } from './any.js';

export const transformArray = (
  value: unknown,
  schema: ArraySchema,
  context = createTransformContext()
): unknown[] | unknown | undefined => {
  const definitions = schema.definitions;

  if (value === undefined) {
    return definitions?.default;
  }

  const arrayValues = definitions?.encoded ? tryDecodeBase64Json(value) : value;

  if (context.convert && typeof arrayValues === 'string') {
    return transformArray(stringToArray(arrayValues), schema, context);
  }

  if (!Array.isArray(arrayValues)) {
    return context.return ? value : undefined;
  }

  const convert = definitions?.encoded ? false : context.convert;

  const output = [];

  for (const elementValue of arrayValues) {
    const result = transformAny(elementValue, schema.element, {
      ...context,
      convert
    });

    output.push(result);
  }

  return output;
};
