import type { AllType, SourceMap, TypeTuple } from '@ez4/reflection';
import type { SchemaDefinitions } from '../types/common.js';
import type { SchemaContext } from '../types/context.js';
import type { TupleSchema } from '../types/type-tuple.js';
import type { AnySchema } from '../types/type-any.js';

import { isTypeTuple } from '@ez4/reflection';

import { SchemaType } from '../types/common.js';
import { getNewContext } from '../types/context.js';
import { getAnySchema } from './any.js';

export type RichTypeTuple = TypeTuple & {
  definitions?: SchemaDefinitions;
};

export const createTupleSchema = (
  elements: AnySchema[],
  description: string | undefined,
  definitions: SchemaDefinitions | undefined
): TupleSchema => {
  return {
    type: SchemaType.Tuple,
    ...(description && { description }),
    ...(definitions && { definitions }),
    elements
  };
};

export const isRichTypeTuple = (type: AllType): type is RichTypeTuple => {
  return isTypeTuple(type);
};

export const getTupleSchema = (
  type: AllType,
  reflection: SourceMap,
  context = getNewContext(),
  description?: string
): TupleSchema | null => {
  if (!isRichTypeTuple(type)) {
    return null;
  }

  const schemas = getAnySchemaFromTypeList(reflection, context, type.elements);

  if (schemas) {
    return createTupleSchema(schemas, description, type.definitions);
  }

  return null;
};

const getAnySchemaFromTypeList = (
  reflection: SourceMap,
  context: SchemaContext,
  types: AllType[]
) => {
  const typeList: AnySchema[] = [];

  for (const type of types) {
    const schema = getAnySchema(type, reflection, context);

    if (schema) {
      typeList.push(schema);
    }
  }

  return typeList;
};
