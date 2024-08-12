import type { AllType, TypeBoolean } from '@ez4/reflection';
import type { BooleanSchema } from '../types/boolean.js';

import { isTypeBoolean } from '@ez4/reflection';

import { ExtraSchema, SchemaTypeName } from '../types/common.js';

export type RichTypeBoolean = TypeBoolean & {
  extra?: ExtraSchema;
};

export const createBooleanSchema = (data: Omit<BooleanSchema, 'type'>): BooleanSchema => {
  const { description, optional, nullable, extra } = data;

  return {
    type: SchemaTypeName.Boolean,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(extra && { extra })
  };
};

export const isRichTypeBoolean = (type: AllType): type is RichTypeBoolean => {
  return isTypeBoolean(type);
};

export const getBooleanSchema = (type: AllType, description?: string): BooleanSchema | null => {
  if (!isRichTypeBoolean(type)) {
    return null;
  }

  return createBooleanSchema({
    extra: type.extra,
    description
  });
};
