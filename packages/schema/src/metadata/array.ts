import type { AllType, SourceMap } from '@ez4/reflection';
import type { AnySchema } from '../types/common.js';
import type { ArraySchema } from '../types/array.js';

import { isTypeArray } from '@ez4/reflection';

import { SchemaTypeName } from '../types/common.js';
import { getAnySchema } from './any.js';

export const createArraySchema = (
  element: AnySchema,
  description: string | undefined
): ArraySchema => {
  return {
    type: SchemaTypeName.Array,
    ...(description && { description }),
    element
  };
};

export const getArraySchema = (
  type: AllType,
  reflection: SourceMap,
  description?: string
): ArraySchema | null => {
  if (!isTypeArray(type)) {
    return null;
  }

  const schema = getAnySchema(type.element, reflection);

  if (schema) {
    return createArraySchema(schema, description);
  }

  return null;
};
