import type { AllType, SourceMap, TypeTuple } from '@ez4/reflection';
import type { SchemaDefinitions } from '../types/common';
import type { SchemaContext } from '../types/context';
import type { TupleSchema } from '../types/type-tuple';
import type { AnySchema } from '../types/type-any';

import { isTypeTuple } from '@ez4/reflection';

import { createSchemaContext } from '../types/context';
import { SchemaType } from '../types/common';
import { getAnySchema } from './any';

export type RichTypeTuple = TypeTuple & {
  definitions?: SchemaDefinitions;
};

export type TupleSchemaData = Omit<TupleSchema, 'type'>;

export const createTupleSchema = (data: TupleSchemaData): TupleSchema => {
  const { description, definitions, elements } = data;

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
  context = createSchemaContext(),
  description?: string
): TupleSchema | null => {
  if (!isRichTypeTuple(type)) {
    return null;
  }

  const elements = getAnySchemaFromTypeList(reflection, context, type.elements);

  if (elements) {
    return createTupleSchema({ definitions: type.definitions, elements, description });
  }

  return null;
};

const getAnySchemaFromTypeList = (reflection: SourceMap, context: SchemaContext, types: AllType[]) => {
  const typeList: AnySchema[] = [];

  for (const type of types) {
    const schema = getAnySchema(type, reflection, context);

    if (schema) {
      typeList.push(schema);
    }
  }

  return typeList;
};
