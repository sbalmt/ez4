import type { AllType, EveryType, ReflectionTypes, TypeUnion } from '@ez4/reflection';
import type { SchemaContext } from '../types/context';
import type { SchemaDefinitions } from '../types/common';
import type { EnumSchema, EnumSchemaOption } from '../types/type-enum';
import type { UnionSchema } from '../types/type-union';
import type { AnySchema } from '../types/type-any';

import { isTypeNull, isTypeUndefined, isTypeUnion } from '@ez4/reflection';
import { deepEqual } from '@ez4/utils';

import { isUnionSchema } from '../types/type-union';
import { isNumberSchema } from '../types/type-number';
import { isReferenceSchema } from '../types/type-reference';
import { isStringSchema } from '../types/type-string';
import { isEnumSchema } from '../types/type-enum';
import { SchemaType } from '../types/common';
import { createEnumSchema } from './enum';
import { getAnySchema } from './any';

export type RichTypeUnion = TypeUnion & {
  definitions?: SchemaDefinitions;
};

export type UnionSchemaData = Omit<UnionSchema, 'type'>;

export const createUnionSchema = (data: UnionSchemaData): UnionSchema => {
  const { description, optional, nullable, elements, definitions } = data;

  return {
    type: SchemaType.Union,
    ...(description && { description }),
    ...(definitions && { definitions }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    elements
  };
};

export const isRichTypeUnion = (type: AllType): type is RichTypeUnion => {
  return isTypeUnion(type);
};

export const getUnionSchema = (
  type: AllType,
  reflection: ReflectionTypes,
  context: SchemaContext,
  description?: string
): AnySchema | null => {
  if (!isRichTypeUnion(type)) {
    return null;
  }

  const { nullish } = context;

  const elements = getAnySchemaFromTypeList(reflection, context, type.elements);

  const optional = hasOptionalType(type.elements);
  const nullable = hasNullableType(type.elements) || (optional && nullish);

  const definitions = type.definitions;

  if (elements.length > 1) {
    const data = { description, optional, nullable, definitions };

    return tryCreateEnumSchema(elements, data) ?? createUnionSchema({ elements, ...data });
  }

  if (elements.length === 1) {
    const single = elements[0];

    if (!isReferenceSchema(single) && description) {
      single.description = description;
    }

    if (nullable) {
      single.nullable = true;
    }

    if (optional) {
      single.optional = true;
    }

    return single;
  }

  return null;
};

const hasOptionalType = (types: EveryType[]) => {
  return types.some((type) => isTypeUndefined(type));
};

const hasNullableType = (types: EveryType[]) => {
  return types.some((type) => isTypeNull(type));
};

const getAnySchemaFromTypeList = (reflection: ReflectionTypes, context: SchemaContext, types: AllType[]) => {
  const typeList: AnySchema[] = [];

  const pushElements = (...elements: AnySchema[]) => {
    for (const element of elements) {
      if (!typeList.some((current) => deepEqual(current, element))) {
        typeList.push(element);
      }
    }
  };

  for (const type of types) {
    const schema = getAnySchema(type, reflection, context);

    if (schema) {
      if (isUnionSchema(schema)) {
        pushElements(...schema.elements);
      } else {
        pushElements(schema);
      }
    }
  }

  return typeList;
};

const tryCreateEnumSchema = (elements: AnySchema[], data: Omit<EnumSchema, 'type' | 'options'>) => {
  const options: EnumSchemaOption[] = [];

  for (const element of elements) {
    if (isEnumSchema(element)) {
      options.push(...element.options);
      continue;
    }

    if ((isNumberSchema(element) || isStringSchema(element)) && element.definitions?.value) {
      options.push({ value: element.definitions.value });
      continue;
    }

    return undefined;
  }

  return createEnumSchema({
    ...data,
    options
  });
};
