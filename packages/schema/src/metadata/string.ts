import type { AllType, TypeString } from '@ez4/reflection';
import type { StringSchema } from '../types/string.js';

import { isTypeString } from '@ez4/reflection';

import { ExtraSchema, SchemaTypeName } from '../types/common.js';

export type RichTypeString = TypeString & {
  minLength?: number;
  maxLength?: number;
  format?: string;
  extra?: ExtraSchema;
};

export const createStringSchema = (data: Omit<StringSchema, 'type'>): StringSchema => {
  const { description, optional, nullable, minLength, maxLength, format, extra } = data;

  return {
    type: SchemaTypeName.String,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(minLength && { minLength }),
    ...(maxLength && { maxLength }),
    ...(format && { format }),
    ...(extra && { extra })
  };
};

export const isRichTypeString = (type: AllType): type is RichTypeString => {
  return isTypeString(type);
};

export const getStringSchema = (type: AllType, description?: string): StringSchema | null => {
  if (!isRichTypeString(type)) {
    return null;
  }

  const { minLength, maxLength, format, extra } = type;

  return createStringSchema({
    description,
    minLength,
    maxLength,
    format,
    extra
  });
};
