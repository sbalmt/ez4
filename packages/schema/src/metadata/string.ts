import type { AllType, TypeString } from '@ez4/reflection';
import type { StringSchema } from '../types/string.js';

import { isTypeString } from '@ez4/reflection';

import { SchemaTypeName } from '../types/common.js';

export type RichTypeString = TypeString & {
  minLength?: number;
  maxLength?: number;
  format?: string;
};

export const createStringSchema = (data: Omit<StringSchema, 'type'>): StringSchema => {
  const { description, optional, nullable, minLength, maxLength, format } = data;

  return {
    type: SchemaTypeName.String,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(minLength && { minLength }),
    ...(maxLength && { maxLength }),
    ...(format && { format })
  };
};

export const isRichTypeString = (type: AllType): type is RichTypeString => {
  return isTypeString(type);
};

export const getStringSchema = (type: AllType, description?: string): StringSchema | null => {
  if (!isRichTypeString(type)) {
    return null;
  }

  const { minLength, maxLength, format } = type;

  return createStringSchema({
    description,
    minLength,
    maxLength,
    format
  });
};
