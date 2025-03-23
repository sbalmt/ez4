import type { ReferenceSchema } from '@ez4/schema';
import type { TransformContext } from '../types/context.js';

import { ReferenceNotFoundError } from '../errors/reference.js';
import { transformObject } from './object.js';

export const transformReference = (value: unknown, schema: ReferenceSchema, context: TransformContext) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const referenceSchema = context.references[schema.identity];

  if (!referenceSchema) {
    throw new ReferenceNotFoundError(schema.identity);
  }

  return transformObject(value, referenceSchema, context);
};
