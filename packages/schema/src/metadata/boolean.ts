import type { AllType, TypeBoolean } from '@ez4/reflection';
import type { BooleanSchema } from '../types/boolean.js';

import { isTypeBoolean } from '@ez4/reflection';

import { SchemaDefinitions, SchemaType } from '../types/common.js';

export type RichTypeBoolean = TypeBoolean & {
  definitions?: SchemaDefinitions;
};

export const createBooleanSchema = (data: Omit<BooleanSchema, 'type'>): BooleanSchema => {
  const { description, optional, nullable, definitions } = data;

  return {
    type: SchemaType.Boolean,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(definitions && { definitions })
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
    definitions: type.definitions,
    description
  });
};
