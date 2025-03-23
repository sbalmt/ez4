import type { AllType, EveryType, SourceMap, TypeUnion } from '@ez4/reflection';
import type { SchemaDefinitions } from '../types/common.js';
import type { SchemaContext } from '../types/context.js';
import type { UnionSchema } from '../types/type-union.js';
import type { AnySchema } from '../types/type-any.js';

import { isTypeNull, isTypeUndefined, isTypeUnion } from '@ez4/reflection';

import { isReferenceSchema } from '../types/type-reference.js';
import { SchemaType } from '../types/common.js';
import { getAnySchema } from './any.js';

export type RichTypeUnion = TypeUnion & {
  definitions?: SchemaDefinitions;
};

export const createUnionSchema = (data: Omit<UnionSchema, 'type'>): UnionSchema => {
  const { description, optional, nullable, elements, definitions } = data;

  return {
    type: SchemaType.Union,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(definitions && { definitions }),
    elements
  };
};

export const isRichTypeUnion = (type: AllType): type is RichTypeUnion => {
  return isTypeUnion(type);
};

export const getUnionSchema = (type: AllType, reflection: SourceMap, context: SchemaContext, description?: string): AnySchema | null => {
  if (!isRichTypeUnion(type)) {
    return null;
  }

  const elements = getAnySchemaFromTypeList(reflection, context, type.elements);
  const optional = hasOptionalType(type.elements);
  const nullable = hasNullableType(type.elements);

  const definitions = type.definitions;

  if (elements.length > 1) {
    return createUnionSchema({
      elements,
      description,
      optional,
      nullable,
      definitions
    });
  }

  if (elements.length === 1) {
    const single = elements[0];

    if (!isReferenceSchema(single) && description) {
      single.description = description;
    }

    if (optional) {
      single.optional = optional;
    }

    if (nullable) {
      single.nullable = nullable;
    }

    return single;
  }

  return null;
};

const hasNullableType = (types: EveryType[]) => {
  return types.some((type) => isTypeNull(type));
};

const hasOptionalType = (types: EveryType[]) => {
  return types.some((type) => isTypeUndefined(type));
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
