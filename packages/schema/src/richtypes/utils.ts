import type { EveryType, TypeObject, TypeTuple } from '@ez4/reflection';
import type { AnyObject } from '@ez4/utils';

import {
  isModelProperty,
  isTypeBoolean,
  isTypeNumber,
  isTypeString,
  isTypeScalar,
  isTypeObject,
  isTypeTuple,
  createBoolean,
  createNumber,
  createString,
  createObject,
  createArray
} from '@ez4/reflection';

import { isAnyBoolean, isAnyNumber, isAnyString } from '@ez4/utils';

import { InvalidRichTypeProperty } from '../errors/richtype.js';

export type RichTypes = {
  format?: string;

  name?: string;
  value?: boolean | number | string | AnyObject;
  type?: EveryType;

  extensible?: boolean;
  pattern?: string;

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

      case 'maxLength':
      case 'minLength':
      case 'minValue':
      case 'maxValue':
        if (isTypeNumber(type)) {
          richTypes[name] = type.literal;
        }
        break;

      case 'type':
        richTypes[name] = type;
        break;

      case 'default':
        if (isTypeScalar(type)) {
          richTypes.value = type.literal;
        } else if (isTypeObject(type)) {
          richTypes.value = getPlainObject(type);
        } else if (isTypeTuple(type)) {
          richTypes.value = getPlainArray(type);
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
          ...(isAnyBoolean(value) && { default: value })
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
          ...(isAnyNumber(value) && { default: value }),
          ...(isAnyNumber(minValue) && { minValue }),
          ...(isAnyNumber(maxValue) && { maxValue })
        }
      };
    }

    case 'string': {
      const { minLength, maxLength, value } = richTypes;

      return {
        ...createString(),
        definitions: {
          ...(isAnyString(value) && { default: value }),
          ...((minLength || maxLength) && { trim: true }),
          ...(minLength && { minLength }),
          ...(maxLength && { maxLength })
        }
      };
    }

    case 'object': {
      const { extensible, value, type = createObject('@ez4/schema') } = richTypes;

      return {
        ...type,
        definitions: {
          ...(value && { default: value }),
          ...(extensible && { extensible })
        }
      };
    }

    case 'array': {
      const { minLength, maxLength, type, value } = richTypes;

      return {
        ...createArray(type!, { spread: false }),
        definitions: {
          ...(value && { default: value }),
          ...(minLength && { minLength }),
          ...(maxLength && { maxLength })
        }
      };
    }

    case 'enum': {
      const { type, value } = richTypes;

      return {
        ...type!,
        definitions: {
          ...(value !== undefined && { default: value })
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

    const { name, value } = member;

    if (isTypeScalar(value)) {
      result[name] = value.literal;
    } else if (isTypeObject(value)) {
      result[name] = getPlainObject(value);
    } else if (isTypeTuple(value)) {
      result[name] = getPlainArray(value);
    }
  }

  return result;
};

const getPlainArray = (tuple: TypeTuple) => {
  const results: unknown[] = [];

  for (const element of tuple.elements) {
    if (isTypeScalar(element)) {
      results.push(element.literal);
    } else if (isTypeObject(element)) {
      results.push(getPlainObject(element));
    } else if (isTypeTuple(element)) {
      results.push(getPlainArray(element));
    }
  }

  return results;
};
