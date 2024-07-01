import type { TypeObject } from '@ez4/reflection';

import {
  createNumber,
  createString,
  isTypeNumber,
  isModelProperty,
  isTypeString
} from '@ez4/reflection';

export type RichTypes = {
  format?: string;

  minLength?: number;
  maxLength?: number;

  minValue?: number;
  maxValue?: number;
};

export const getRichTypes = (type: TypeObject) => {
  const richTypes: RichTypes = {};

  type.members?.forEach((member) => {
    if (!isModelProperty(member)) {
      return;
    }

    const type = member.value;
    const name = member.name;

    switch (name) {
      case '@ez4/schema':
        if (isTypeString(type)) {
          richTypes.format = type.literal;
        }
        break;

      case 'minValue':
      case 'maxValue':
      case 'maxLength':
      case 'minLength':
        if (isTypeNumber(type)) {
          richTypes[name] = type.literal;
        }
        break;
    }
  });

  if (Object.values(richTypes).length) {
    return richTypes;
  }

  return null;
};

export const createRichType = (richTypes: RichTypes) => {
  const format = richTypes.format;

  switch (format) {
    case 'integer':
    case 'decimal':
      const { minValue, maxValue } = richTypes;

      return {
        ...createNumber(),
        format,
        ...(minValue && { minValue }),
        ...(maxValue && { maxValue })
      };

    case 'string':
      const { minLength, maxLength } = richTypes;

      return {
        ...createString(),
        ...(minLength && { minLength }),
        ...(maxLength && { maxLength })
      };

    default:
      return {
        ...createString(),
        ...(format && { format })
      };
  }
};
