import type { SourceMap, AllType } from '@ez4/reflection';

import { createSchemaContext } from '../types/context';
import { getScalarSchema } from './scalar';
import { getObjectSchema } from './object';
import { getUnionSchema } from './union';
import { getArraySchema } from './array';
import { getTupleSchema } from './tuple';
import { getEnumSchema } from './enum';

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
