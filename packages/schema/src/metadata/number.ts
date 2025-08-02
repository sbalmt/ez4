import type { AllType, TypeNumber } from '@ez4/reflection';
import type { NumberSchema } from '../types/type-number.js';
import type { SchemaDefinitions } from '../types/common.js';

import { isTypeNumber } from '@ez4/reflection';

import { SchemaType } from '../types/common.js';

export type RichTypeNumber = TypeNumber & {
  format?: string;
  definitions?: SchemaDefinitions;
};

export const createNumberSchema = (data: Omit<NumberSchema, 'type'>): NumberSchema => {
  const { description, optional, nullable, format, definitions } = data;

  return {
    type: SchemaType.Number,
    ...(description && { description }),
    ...(definitions && { definitions }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(format && { format })
  };
};

export const isRichTypeNumber = (type: AllType): type is RichTypeNumber => {
  return isTypeNumber(type);
};

export const getNumberSchema = (type: AllType, description?: string): NumberSchema | null => {
  if (!isRichTypeNumber(type)) {
    return null;
  }

  const { format, definitions } = type;

  return createNumberSchema({
    definitions: type.literal !== undefined ? { value: type.literal } : definitions,
    description,
    format
  });
};
