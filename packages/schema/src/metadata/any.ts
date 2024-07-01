import type { SourceMap, AllType } from '@ez4/reflection';

import { getScalarSchema } from './scalar.js';
import { getObjectSchema } from './object.js';
import { getUnionSchema } from './union.js';
import { getArraySchema } from './array.js';
import { getTupleSchema } from './tuple.js';
import { getEnumSchema } from './enum.js';

export const getAnySchema = (type: AllType, reflection: SourceMap, description?: string) => {
  return (
    getScalarSchema(type, description) ||
    getObjectSchema(type, reflection, description) ||
    getUnionSchema(type, reflection, description) ||
    getArraySchema(type, reflection, description) ||
    getTupleSchema(type, reflection, description) ||
    getEnumSchema(type, reflection, description)
  );
};
