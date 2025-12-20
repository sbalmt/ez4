import type { SourceMap, AllType } from '@ez4/reflection';

import { createSchemaContext } from '../types/context';
import { getScalarSchema } from './scalar';
import { getReferenceSchema } from './reference';
import { getIntersectionSchema } from './intersection';
import { getObjectSchema } from './object';
import { getUnionSchema } from './union';
import { getArraySchema } from './array';
import { getTupleSchema } from './tuple';
import { getEnumSchema } from './enum';

export const getAnySchema = (type: AllType, reflection: SourceMap, context = createSchemaContext(), description?: string) => {
  return (
    getScalarSchema(type, description) ||
    getReferenceSchema(type, reflection, context, description) ||
    getIntersectionSchema(type, reflection, context, description) ||
    getObjectSchema(type, reflection, context, description) ||
    getUnionSchema(type, reflection, context, description) ||
    getArraySchema(type, reflection, context, description) ||
    getTupleSchema(type, reflection, context, description) ||
    getEnumSchema(type, description)
  );
};
