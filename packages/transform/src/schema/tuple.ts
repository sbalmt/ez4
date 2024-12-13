import type { TupleSchema } from '@ez4/schema';

import { getNewContext } from '../types/context.js';
import { transformAny } from './any.js';

export const transformTuple = (value: unknown, schema: TupleSchema, context = getNewContext()) => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const output = [];

  for (let index = 0; index < schema.elements.length; index++) {
    const elementSchema = schema.elements[index];

    output.push(transformAny(value[index], elementSchema, context));
  }

  return output;
};
