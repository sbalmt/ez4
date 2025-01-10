import type { AllType, TypeString } from '@ez4/reflection';
import type { StringSchema } from '../types/type-string.js';

import { isTypeString } from '@ez4/reflection';

import { SchemaDefinitions, SchemaType } from '../types/common.js';

export type RichTypeString = TypeString & {
  format?: string;
  definitions?: SchemaDefinitions;
};

export const createStringSchema = (data: Omit<StringSchema, 'type'>): StringSchema => {
  const { description, optional, nullable, format, definitions } = data;

  return {
    type: SchemaType.String,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(format && { format }),
    ...(definitions && { definitions })
  };
};

export const isRichTypeString = (type: AllType): type is RichTypeString => {
  return isTypeString(type);
};

export const getStringSchema = (type: AllType, description?: string): StringSchema | null => {
  if (!isRichTypeString(type)) {
    return null;
  }

  const { format, definitions } = type;

  return createStringSchema({
    definitions: type.literal ? { value: type.literal } : definitions,
    description,
    format
  });
};
