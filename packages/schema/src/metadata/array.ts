import type { AllType, SourceMap, TypeArray } from '@ez4/reflection';
import type { AnySchema, ExtraSchema } from '../types/common.js';
import type { ArraySchema } from '../types/array.js';

import { isTypeArray } from '@ez4/reflection';

import { SchemaType } from '../types/common.js';
import { getAnySchema } from './any.js';

export type RichTypeArray = TypeArray & {
  extra?: ExtraSchema;
};

export const createArraySchema = (
  element: AnySchema,
  description: string | undefined,
  extra: ExtraSchema | undefined
): ArraySchema => {
  return {
    type: SchemaType.Array,
    ...(description && { description }),
    ...(extra && { extra }),
    element
  };
};

export const isRichTypeArray = (type: AllType): type is RichTypeArray => {
  return isTypeArray(type);
};

export const getArraySchema = (
  type: AllType,
  reflection: SourceMap,
  description?: string
): ArraySchema | null => {
  if (!isRichTypeArray(type)) {
    return null;
  }

  const schema = getAnySchema(type.element, reflection);

  if (schema) {
    return createArraySchema(schema, description, type.extra);
  }

  return null;
};
