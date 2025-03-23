import type { SourceMap, AllType } from '@ez4/reflection';

import { createSchemaContext } from '../types/context.js';
import { getScalarSchema } from './scalar.js';
import { getObjectSchema } from './object.js';
import { getUnionSchema } from './union.js';
import { getArraySchema } from './array.js';
import { getTupleSchema } from './tuple.js';
import { getEnumSchema } from './enum.js';

export const getAnySchema = (type: AllType, reflection: SourceMap, context = createSchemaContext(), description?: string) => {
  return (
    getScalarSchema(type, description) ||
    getObjectSchema(type, reflection, context, description) ||
    getUnionSchema(type, reflection, context, description) ||
    getArraySchema(type, reflection, context, description) ||
    getTupleSchema(type, reflection, context, description) ||
    getEnumSchema(type, reflection, description)
  );
};
