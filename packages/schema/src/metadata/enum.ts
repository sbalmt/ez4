import type { AllType, EnumMember, SourceMap, TypeEnum } from '@ez4/reflection';
import type { EnumSchema, EnumSchemaOption } from '../types/type-enum.js';

import { isTypeEnum, isTypeReference } from '@ez4/reflection';

import { SchemaDefinitions, SchemaType } from '../types/common.js';

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
    const statement = reflection[type.path];

    if (statement) {
      return getEnumSchema(statement, reflection, description);
    }

    return null;
  }

  if (isRichTypeEnum(type) && type.members?.length) {
    return createEnumSchema(getAnySchemaFromMembers(type.members), description, type.definitions);
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
