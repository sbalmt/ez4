import type { AllType, EnumMember, SourceMap } from '@ez4/reflection';
import type { EnumSchema, EnumSchemaOption } from '../types/enum.js';

import { isTypeEnum, isTypeReference } from '@ez4/reflection';

import { SchemaTypeName } from '../types/common.js';

export const createEnumSchema = (
  options: EnumSchemaOption[],
  description: string | undefined
): EnumSchema => {
  return {
    type: SchemaTypeName.Enum,
    ...(description && { description }),
    options
  };
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

  if (isTypeEnum(type) && type.members?.length) {
    return createEnumSchema(getAnySchemaFromMembers(type.members), description);
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
