import type { AllType, TypeReference } from '@ez4/reflection';
import type { ReferenceSchema } from '../types/type-reference';
import type { SchemaDefinitions } from '../types/common';

import { isTypeReference } from '@ez4/reflection';

import { SchemaType } from '../types/common';

export type RichTypeReference = TypeReference & {
  definitions?: SchemaDefinitions;
};

export type ReferenceSchemaData = Omit<ReferenceSchema, 'type'>;

export const createReferenceSchema = (data: ReferenceSchemaData): ReferenceSchema => {
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
