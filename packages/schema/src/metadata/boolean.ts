import type { AllType } from '@ez4/reflection';
import type { BooleanSchema } from '../types/boolean.js';

import { isTypeBoolean } from '@ez4/reflection';

import { SchemaTypeName } from '../types/common.js';

export const createBooleanSchema = (data: Omit<BooleanSchema, 'type'>): BooleanSchema => {
  const { description, optional, nullable } = data;

  return {
    type: SchemaTypeName.Boolean,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable })
  };
};

export const getBooleanSchema = (type: AllType, description?: string): BooleanSchema | null => {
  if (!isTypeBoolean(type)) {
    return null;
  }

  return createBooleanSchema({
    description
  });
};
