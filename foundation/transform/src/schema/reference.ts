import type { ReferenceSchema } from '@ez4/schema';

import { ReferenceNotFoundError } from '../errors/reference.js';
import { createTransformContext } from '../types/context.js';
import { transformObject } from './object.js';

export const transformReference = (value: unknown, schema: ReferenceSchema, context = createTransformContext()) => {
  if (value === undefined) {
    return undefined;
  }

  const referenceSchema = context.references[schema.identity];

  if (!referenceSchema) {
    throw new ReferenceNotFoundError(schema.identity);
  }

  return transformObject(value, referenceSchema, context);
};
