import type { ReferenceSchema } from '@ez4/schema';

import { ReferenceNotFoundError } from '../errors/reference';
import { createTransformContext } from '../types/context';
import { transformObject } from './object';

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
