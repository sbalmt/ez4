import type { ReferenceSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context.js';

import { isNullish } from '../utils/nullish.js';
import { ReferenceNotFoundError } from '../errors/reference.js';
import { validateObject } from './object.js';

export const validateReference = async (value: unknown, schema: ReferenceSchema, context: ValidationContext) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const referenceSchema = context.references[schema.identity];

  if (!referenceSchema) {
    throw new ReferenceNotFoundError(schema.identity, context.property);
  }

  return validateObject(value, referenceSchema, context);
};
