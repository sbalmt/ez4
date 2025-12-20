import type { AllType, SourceMap, TypeReference } from '@ez4/reflection';
import type { ReferenceSchema } from '../types/type-reference';
import type { SchemaDefinitions } from '../types/common';
import type { SchemaContext } from '../types/context';
import type { AnySchema } from '../types/type-any';

import { isModelProperty, isTypeModel, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyArray } from '@ez4/utils';

import { SchemaReferenceIndexNotFound, SchemaReferenceNotFound } from '../errors/reference';
import { createSchemaContext } from '../types/context';
import { SchemaType } from '../types/common';
import { getAnySchema } from './any';

export type RichTypeReference = TypeReference & {
  definitions?: SchemaDefinitions;
};

export type ReferenceSchemaData = Omit<ReferenceSchema, 'type'>;

export const createReferenceSchema = (data: ReferenceSchemaData): ReferenceSchema => {
  const { identity, nullable, optional } = data;

  return {
    type: SchemaType.Reference,
    ...(nullable && { nullable }),
    ...(optional && { optional }),
    identity
  };
};

export const isRichTypeReference = (type: AllType): type is RichTypeReference => {
  return isTypeReference(type);
};

export const getReferenceSchema = (
  type: AllType,
  reflection: SourceMap,
  context = createSchemaContext(),
  description?: string
): AnySchema | null => {
  if (!isRichTypeReference(type)) {
    return null;
  }

  const declaration = reflection[type.path];

  if (!declaration) {
    throw new SchemaReferenceNotFound(type.path);
  }

  const schema = getReferenceTypeSchema(type, declaration, reflection, context, description);

  if (schema && type.definitions) {
    schema.definitions = {
      ...schema.definitions,
      ...type.definitions
    };
  }

  return schema;
};

const getReferenceTypeSchema = (
  type: TypeReference,
  declaration: AllType,
  reflection: SourceMap,
  context: SchemaContext,
  description?: string
) => {
  if (!type.index) {
    return getAnySchema(declaration, reflection, context, description);
  }

  const member = getReferenceMember(declaration, type.index);

  if (!member || !isModelProperty(member)) {
    throw new SchemaReferenceIndexNotFound(type.path, type.index);
  }

  return getAnySchema(member.value, reflection, context, description);
};

const getReferenceMember = (type: AllType, index: string) => {
  if (isTypeModel(type)) {
    const member = type.members?.find(({ name }) => name === index);

    if (!member) {
      const heritageMembers = type.heritage?.flatMap(({ members }) => members);

      return heritageMembers?.find((member) => member?.name === index);
    }

    return member;
  }

  if (isTypeObject(type) && isAnyArray(type.members)) {
    return type.members.find(({ name }) => name === index);
  }

  return null;
};
