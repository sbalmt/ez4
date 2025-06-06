import type { AllType, SourceMap, TypeArray } from '@ez4/reflection';
import type { SchemaDefinitions } from '../types/common.js';
import type { ArraySchema } from '../types/type-array.js';

import { isTypeArray } from '@ez4/reflection';

import { createSchemaContext } from '../types/context.js';
import { SchemaType } from '../types/common.js';
import { getAnySchema } from './any.js';

export type RichTypeArray = TypeArray & {
  definitions?: SchemaDefinitions;
};

export const createArraySchema = (data: Omit<ArraySchema, 'type'>): ArraySchema => {
  const { description, optional, nullable, element, definitions } = data;

  return {
    type: SchemaType.Array,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(definitions && { definitions }),
    element
  };
};

export const isRichTypeArray = (type: AllType): type is RichTypeArray => {
  return isTypeArray(type);
};

export const getArraySchema = (
  type: AllType,
  reflection: SourceMap,
  context = createSchemaContext(),
  description?: string
): ArraySchema | null => {
  if (!isRichTypeArray(type)) {
    return null;
  }

  const element = getAnySchema(type.element, reflection, context);

  if (element) {
    return createArraySchema({
      definitions: type.definitions,
      description,
      element
    });
  }

  return null;
};
