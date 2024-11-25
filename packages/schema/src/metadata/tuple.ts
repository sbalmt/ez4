import type { AllType, SourceMap, TypeTuple } from '@ez4/reflection';
import type { AnySchema, ExtraSchema } from '../types/common.js';
import type { TupleSchema } from '../types/tuple.js';

import { isTypeTuple } from '@ez4/reflection';

import { SchemaType } from '../types/common.js';
import { getAnySchema } from './any.js';

export type RichTypeTuple = TypeTuple & {
  extra?: ExtraSchema;
};

export const createTupleSchema = (
  elements: AnySchema[],
  description: string | undefined,
  extra: ExtraSchema | undefined
): TupleSchema => {
  return {
    type: SchemaType.Tuple,
    ...(description && { description }),
    ...(extra && { extra }),
    elements
  };
};

export const isRichTypeTuple = (type: AllType): type is RichTypeTuple => {
  return isTypeTuple(type);
};

export const getTupleSchema = (
  type: AllType,
  reflection: SourceMap,
  description?: string
): TupleSchema | null => {
  if (!isRichTypeTuple(type)) {
    return null;
  }

  const schemas = getAnySchemaFromTypeList(reflection, type.elements);

  if (schemas) {
    return createTupleSchema(schemas, description, type.extra);
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
