import type { TupleSchema } from '@ez4/schema';

import { transformAny } from './any.js';

export const transformTuple = (value: unknown, schema: TupleSchema) => {
  if (!(value instanceof Array)) {
    return undefined;
  }

  const output = [];

  for (let index = 0; index < schema.elements.length; index++) {
    const elementSchema = schema.elements[index];

    output.push(transformAny(value[index], elementSchema));
  }

  return output;
};
