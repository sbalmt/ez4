import type { AllType, TypeString } from '@ez4/reflection';
import type { StringSchema } from '../types/string.js';

import { isTypeString } from '@ez4/reflection';

import { ExtraSchema, SchemaType } from '../types/common.js';

export type RichTypeString = TypeString & {
  format?: string;
  extra?: ExtraSchema;
};

export const createStringSchema = (data: Omit<StringSchema, 'type'>): StringSchema => {
  const { description, optional, nullable, format, extra } = data;

  return {
    type: SchemaType.String,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
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

  const { format, extra } = type;

  return createStringSchema({
    extra: type.literal ? { value: type.literal } : extra,
    description,
    format
  });
};
