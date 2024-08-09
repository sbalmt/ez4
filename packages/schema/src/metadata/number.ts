import type { AllType, TypeNumber } from '@ez4/reflection';
import type { NumberSchema } from '../types/number.js';

import { isTypeNumber } from '@ez4/reflection';

import { ExtraSchema, SchemaTypeName } from '../types/common.js';

export type RichTypeNumber = TypeNumber & {
  minValue?: number;
  maxValue?: number;
  format?: string;
  extra?: ExtraSchema;
};

export const createNumberSchema = (data: Omit<NumberSchema, 'type'>): NumberSchema => {
  const { description, optional, nullable, minValue, maxValue, format, extra } = data;

  return {
    type: SchemaTypeName.Number,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(minValue && { minValue }),
    ...(maxValue && { maxValue }),
    ...(format && { format }),
    ...(extra && { extra })
  };
};

export const isRichTypeNumber = (type: AllType): type is RichTypeNumber => {
  return isTypeNumber(type);
};

export const getNumberSchema = (type: AllType, description?: string): NumberSchema | null => {
  if (!isRichTypeNumber(type)) {
    return null;
  }

  const { minValue, maxValue, format, extra } = type;

  return createNumberSchema({
    description,
    minValue,
    maxValue,
    format,
    extra
  });
};
