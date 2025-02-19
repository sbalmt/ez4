import type { TypeObject, TypeReference } from '@ez4/reflection';
import type { AnyObject } from '@ez4/utils';

import {
  isModelProperty,
  isTypeBoolean,
  isTypeNumber,
  isTypeString,
  isTypeScalar,
  isTypeReference,
  isTypeObject,
  createBoolean,
  createNumber,
  createString,
  createObject
} from '@ez4/reflection';

import { InvalidRichTypeProperty } from '../errors/richtype.js';

export type RichTypes = {
  format?: string;
  name?: string;
  pattern?: string;
  value?: boolean | number | string | AnyObject;
  reference?: TypeReference;
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

      case 'reference':
        if (isTypeReference(type)) {
          richTypes[name] = type;
        }
        break;

      case 'default':
        if (isTypeScalar(type)) {
          richTypes.value = type.literal;
        } else if (isTypeObject(type)) {
          richTypes.value = getPlainObject(type);
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
    case 'boolean': {
      const { value } = richTypes;

      return {
        ...createBoolean(),
        definitions: {
          ...(value && { default: value })
        }
      };
    }

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
      const { extensible, value } = richTypes;

      return {
        ...createObject('@ez4/schema'),
        definitions: {
          ...(value && { default: value }),
          ...(extensible && { extensible })
        }
      };
    }

    case 'enum': {
      const { reference, value } = richTypes;

      return {
        ...reference!,
        definitions: {
          ...(value && { default: value })
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

const getPlainObject = (object: TypeObject) => {
  const result: AnyObject = {};

  if (!Array.isArray(object.members)) {
    return result;
  }

  for (const member of object.members) {
    if (!isModelProperty(member)) {
      continue;
    }

    if (isTypeScalar(member.value)) {
      result[member.name] = member.value.literal;
    } else if (isTypeObject(member.value)) {
      result[member.name] = getPlainObject(member.value);
    }
  }

  return result;
};
