import type { TupleSchema } from '@ez4/schema';

import { createTransformContext } from '../types/context';
import { stringToArray } from '../utils/array';
import { transformAny } from './any';

export const transformTuple = (
  value: unknown,
  schema: TupleSchema,
  context = createTransformContext()
): unknown[] | unknown | undefined => {
  if (value === undefined) {
    return schema.definitions?.default;
  }

  if (context.convert && typeof value === 'string') {
    return transformTuple(stringToArray(value), schema, context);
  }

  if (!Array.isArray(value)) {
    return context.return ? value : undefined;
  }

  const output = [];

  for (let index = 0; index < schema.elements.length; index++) {
    const elementSchema = schema.elements[index];

    output.push(transformAny(value[index], elementSchema, context));
  }

  return output;
};
