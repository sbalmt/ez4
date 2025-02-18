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

import { InvalidRichTypeProperty } from '../errors/richtype.js';

export type RichTypes = {
  format?: string;

  name?: string;
  pattern?: string;
  value?: string | number;

  extensible?: boolean;

  minLength?: number;
  maxLength?: number;

  minValue?: number;
  maxValue?: number;
};

export const getRichTypes = (type: TypeObject) => {
  const richTypes: RichTypes = {};

  if (!Array.isArray(type.members)) {
    return null;
  }

  type.members.forEach((member) => {
    if (!isModelProperty(member)) {
      return;
    }

    const type = member.value;
    const name = member.name;

    switch (name) {
      case '@ez4/schema':
        if (!isTypeString(type)) {
          throw new InvalidRichTypeProperty(name, 'string');
        }
        richTypes.format = type.literal;
        break;

      case 'name':
      case 'pattern':
        if (!isTypeString(type)) {
          throw new InvalidRichTypeProperty(name, 'string');
        }
        richTypes[name] = type.literal;
        break;

      case 'extensible':
        if (!isTypeBoolean(type)) {
          throw new InvalidRichTypeProperty(name, 'boolean');
        }
        richTypes[name] = type.literal;
        break;

      case 'minValue':
      case 'maxValue':
      case 'maxLength':
      case 'minLength':
        if (!isTypeNumber(type)) {
          throw new InvalidRichTypeProperty(name, 'number');
        }
        richTypes[name] = type.literal;
        break;

      case 'default':
        if (!isTypeNumber(type) && !isTypeString(type)) {
          throw new InvalidRichTypeProperty(name, 'string or number');
        }
        richTypes.value = type.literal;
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
    case 'decimal': {
      const { minValue, maxValue, value } = richTypes;

      return {
        ...createNumber(),
        format,
        definitions: {
          ...(value && { default: value }),
          ...(minValue && { minValue }),
          ...(maxValue && { maxValue })
        }
      };
    }

    case 'string': {
      const { minLength, maxLength, value } = richTypes;

      return {
        ...createString(),
        definitions: {
          ...(value && { default: value }),
          ...(minLength && { minLength }),
          ...(maxLength && { maxLength })
        }
      };
    }

    case 'object': {
      const { extensible } = richTypes;

      return {
        ...createObject('@ez4/schema'),
        definitions: {
          ...(extensible && { extensible })
        }
      };
    }

    default: {
      const { pattern, name, value } = richTypes;

      return {
        ...createString(),
        ...(format && { format }),
        definitions: {
          ...(value && { default: value }),
          ...(pattern && { pattern }),
          ...(name && { name })
        }
      };
    }
  }
};
