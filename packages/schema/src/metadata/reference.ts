import type { AllType, TypeReference } from '@ez4/reflection';
import type { ReferenceSchema } from '../types/type-reference.js';

import { SchemaDefinitions, SchemaType } from '../types/common.js';
import { isTypeReference } from '@ez4/reflection';

export type RichTypeReference = TypeReference & {
  definitions?: SchemaDefinitions;
};

export const createReferenceSchema = (data: Omit<ReferenceSchema, 'type'>): ReferenceSchema => {
  const { identity, nullable, optional } = data;

  return {
    type: SchemaType.Reference,
    ...(nullable && { nullable }),
    ...(optional && { optional }),
    identity
  };
};

export const isRichTypeReference = (type: AllType): type is RichTypeReference => {
  return isTypeReference(type);
};
