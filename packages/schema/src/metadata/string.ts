import type { AllType, TypeString } from '@ez4/reflection';
import type { StringSchema } from '../types/string.js';

import { isTypeString } from '@ez4/reflection';

import { ExtraSchema, SchemaTypeName } from '../types/common.js';

export type RichTypeString = TypeString & {
  format?: string;
  extra?: ExtraSchema;
};

export const createStringSchema = (data: Omit<StringSchema, 'type'>): StringSchema => {
  const { description, optional, nullable, format, extra } = data;

  return {
    type: SchemaTypeName.String,
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
    description,
    format,
    extra
  });
};
