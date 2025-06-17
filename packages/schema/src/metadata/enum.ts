import type { AllType, EnumMember, SourceMap, TypeEnum } from '@ez4/reflection';
import type { EnumSchema, EnumSchemaOption } from '../types/type-enum.js';

import { isTypeEnum, isTypeReference } from '@ez4/reflection';

import { SchemaReferenceNotFound } from '../errors/reference.js';
import { SchemaDefinitions, SchemaType } from '../types/common.js';
import { isRichTypeReference } from './reference.js';

export type RichTypeEnum = TypeEnum & {
  definitions?: SchemaDefinitions;
};

export const createEnumSchema = (
  options: EnumSchemaOption[],
  description: string | undefined,
  definitions: SchemaDefinitions | undefined
): EnumSchema => {
  return {
    type: SchemaType.Enum,
    ...(description && { description }),
    ...(definitions && { definitions }),
    options
  };
};

export const isRichTypeEnum = (type: AllType): type is RichTypeEnum => {
  return isTypeEnum(type);
};

export const getEnumSchema = (
  type: AllType,
  reflection: SourceMap,
  description?: string
): EnumSchema | null => {
  if (isTypeReference(type)) {
    const declaration = reflection[type.path];

    if (!declaration) {
      throw new SchemaReferenceNotFound(type.path);
    }

    const schema = getEnumSchema(declaration, reflection, description);

    if (isRichTypeReference(type) && type.definitions && schema) {
      schema.definitions = {
        ...schema.definitions,
        ...type.definitions
      };
    }

    return schema;
  }

  if (isRichTypeEnum(type) && type.members?.length) {
    const options = getAnySchemaFromMembers(type.members);

    return createEnumSchema(options, description, type.definitions);
  }

  return null;
};

const getAnySchemaFromMembers = (members: EnumMember[]) => {
  const options: EnumSchemaOption[] = [];

  for (const { value, description } of members) {
    options.push({
      value,
      ...(description && { description })
    });
  }

  return options;
};
