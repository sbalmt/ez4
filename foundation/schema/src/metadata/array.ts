import type { AllType, SourceMap, TypeArray } from '@ez4/reflection';
import type { SchemaDefinitions } from '../types/common';
import type { ArraySchema } from '../types/type-array';

import { isTypeArray } from '@ez4/reflection';

import { createSchemaContext } from '../types/context';
import { SchemaType } from '../types/common';
import { getAnySchema } from './any';

export type RichTypeArray = TypeArray & {
  definitions?: SchemaDefinitions;
};

export type ArraySchemaData = Omit<ArraySchema, 'type'>;

export const createArraySchema = (data: ArraySchemaData): ArraySchema => {
  const { description, optional, nullable, element, definitions } = data;

  return {
    type: SchemaType.Array,
    ...(description && { description }),
    ...(definitions && { definitions }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
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
