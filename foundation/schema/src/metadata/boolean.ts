import type { AllType, TypeBoolean } from '@ez4/reflection';
import type { BooleanSchema } from '../types/type-boolean.js';
import type { SchemaDefinitions } from '../types/common.js';

import { isTypeBoolean } from '@ez4/reflection';

import { SchemaType } from '../types/common.js';

export type RichTypeBoolean = TypeBoolean & {
  definitions?: SchemaDefinitions;
};

export type BooleanSchemaData = Omit<BooleanSchema, 'type'>;

export const createBooleanSchema = (data: BooleanSchemaData): BooleanSchema => {
  const { description, optional, nullable, definitions } = data;

  return {
    type: SchemaType.Boolean,
    ...(description && { description }),
    ...(definitions && { definitions }),
    ...(optional && { optional }),
    ...(nullable && { nullable })
  };
};

export const isRichTypeBoolean = (type: AllType): type is RichTypeBoolean => {
  return isTypeBoolean(type);
};

export const getBooleanSchema = (type: AllType, description?: string): BooleanSchema | null => {
  if (!isRichTypeBoolean(type)) {
    return null;
  }

  const { definitions } = type;

  return createBooleanSchema({
    definitions: type.literal !== undefined ? { value: type.literal } : definitions,
    description
  });
};
