import type { AllType, EveryType, SourceMap, TypeUnion } from '@ez4/reflection';
import type { AnySchema, ExtraSchema } from '../types/common.js';
import type { UnionSchema } from '../types/union.js';

import { isTypeNull, isTypeUndefined, isTypeUnion } from '@ez4/reflection';

import { SchemaType } from '../types/common.js';
import { getAnySchema } from './any.js';

export type RichTypeUnion = TypeUnion & {
  extra?: ExtraSchema;
};

export const createUnionSchema = (data: Omit<UnionSchema, 'type'>): UnionSchema => {
  const { description, optional, nullable, elements, extra } = data;

  return {
    type: SchemaType.Union,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(extra && { extra }),
    elements
  };
};

export const isRichTypeUnion = (type: AllType): type is RichTypeUnion => {
  return isTypeUnion(type);
};

export const getUnionSchema = (
  type: AllType,
  reflection: SourceMap,
  description?: string
): AnySchema | null => {
  if (!isRichTypeUnion(type)) {
    return null;
  }

  const elements = getAnySchemaFromTypeList(reflection, type.elements);
  const optional = hasOptionalType(type.elements);
  const nullable = hasNullableType(type.elements);

  const extra = type.extra;

  if (elements.length > 1) {
    return createUnionSchema({
      elements,
      description,
      optional,
      nullable,
      extra
    });
  }

  if (elements.length === 1) {
    const single = elements[0];

    if (description) {
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
