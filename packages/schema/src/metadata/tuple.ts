import type { AllType, SourceMap } from '@ez4/reflection';
import type { AnySchema } from '../types/common.js';
import type { TupleSchema } from '../types/tuple.js';

import { isTypeTuple } from '@ez4/reflection';

import { SchemaTypeName } from '../types/common.js';
import { getAnySchema } from './any.js';

export const createTupleSchema = (
  elements: AnySchema[],
  description: string | undefined
): TupleSchema => {
  return {
    type: SchemaTypeName.Tuple,
    ...(description && { description }),
    elements
  };
};

export const getTupleSchema = (
  type: AllType,
  reflection: SourceMap,
  description?: string
): TupleSchema | null => {
  if (!isTypeTuple(type)) {
    return null;
  }

  const schemas = getAnySchemaFromTypeList(reflection, type.elements);

  if (schemas) {
    return createTupleSchema(schemas, description);
  }

  return null;
};

const getAnySchemaFromTypeList = (reflection: SourceMap, types: AllType[]) => {
  const typeList: AnySchema[] = [];

  for (const type of types) {
    const schema = getAnySchema(type, reflection);

    if (schema) {
      typeList.push(schema);
    }
  }

  return typeList;
};
