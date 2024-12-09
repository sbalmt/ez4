import type { TypeObject } from '@ez4/reflection';

import {
  isModelProperty,
  isTypeBoolean,
  isTypeNumber,
  isTypeString,
  createNumber,
  createString,
  createObject
} from '@ez4/reflection';

export type RichTypes = {
  format?: string;

  name?: string;
  pattern?: string;

  extensible?: boolean;

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

      case 'name':
      case 'pattern':
        if (isTypeString(type)) {
          richTypes[name] = type.literal;
        }
        break;

      case 'extensible':
        if (isTypeBoolean(type)) {
          richTypes[name] = type.literal;
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

  if (richTypes.format) {
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
        definitions: {
          ...(minValue && { minValue }),
          ...(maxValue && { maxValue })
        }
      };

    case 'string':
      const { minLength, maxLength } = richTypes;

      return {
        ...createString(),
        definitions: {
          ...(minLength && { minLength }),
          ...(maxLength && { maxLength })
        }
      };

    case 'object':
      const { extensible } = richTypes;

      return {
        ...createObject('@ez4/schema'),
        definitions: {
          ...(extensible && { extensible })
        }
      };

    default:
      const { pattern, name } = richTypes;

      return {
        ...createString(),
        ...(format && { format }),
        definitions: {
          ...(pattern && { pattern }),
          ...(name && { name })
        }
      };
  }
};
