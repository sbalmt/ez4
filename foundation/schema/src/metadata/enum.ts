import type { AllType, EnumMember, TypeEnum } from '@ez4/reflection';
import type { EnumSchema, EnumSchemaOption } from '../types/type-enum';
import type { SchemaDefinitions } from '../types/common';

import { isTypeEnum } from '@ez4/reflection';

import { SchemaType } from '../types/common';

export type RichTypeEnum = TypeEnum & {
  definitions?: SchemaDefinitions;
};

export type EnumSchemaData = Omit<EnumSchema, 'type'>;

export const createEnumSchema = (data: EnumSchemaData): EnumSchema => {
  const { options, description, optional, nullable, definitions } = data;

  return {
    type: SchemaType.Enum,
    ...(description && { description }),
    ...(definitions && { definitions }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    options
  };
};

export const isRichTypeEnum = (type: AllType): type is RichTypeEnum => {
  return isTypeEnum(type);
};

export const getEnumSchema = (type: AllType, description?: string): EnumSchema | null => {
  if (isRichTypeEnum(type) && type.members?.length) {
    const options = getAnySchemaFromMembers(type.members);

    return createEnumSchema({
      definitions: type.definitions,
      description,
      options
    });
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
