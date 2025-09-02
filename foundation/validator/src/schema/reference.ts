import type { ReferenceSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { isNullish } from '../utils/nullish';
import { ReferenceNotFoundError } from '../errors/reference';
import { validateObject } from './object';

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
