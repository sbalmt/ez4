import type { ReferenceSchema } from '../types/type-reference.js';

import { SchemaType } from '../types/common.js';

export const createReferenceSchema = (data: Omit<ReferenceSchema, 'type'>): ReferenceSchema => {
  const { identity, nullable, optional } = data;

  return {
    type: SchemaType.Reference,
    ...(nullable && { nullable }),
    ...(optional && { optional }),
    identity
  };
};
