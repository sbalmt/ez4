import type { TupleSchema } from '@ez4/schema';

import { createTransformContext } from '../types/context.js';
import { stringToArray } from '../utils/array.js';
import { transformAny } from './any.js';

export const transformTuple = (value: unknown, schema: TupleSchema, context = createTransformContext()): unknown[] | undefined => {
  if (context.convert && typeof value === 'string') {
    return transformTuple(stringToArray(value), schema, context);
  }

  if (!Array.isArray(value)) {
    return schema.definitions?.default;
  }

  const output = [];

  for (let index = 0; index < schema.elements.length; index++) {
    const elementSchema = schema.elements[index];

    output.push(transformAny(value[index], elementSchema, context));
  }

  return output;
};
