import type { TypeObject } from '@ez4/reflection';

import {
  createBoolean,
  createNever,
  createNumber,
  createObject,
  createString,
  isModelProperty,
  isTypeObject,
  isTypeReference,
  isTypeScalar,
  isTypeString,
  TypeName
} from '@ez4/reflection';

import { isAnyArray, isAnyBoolean, isAnyNumber } from '@ez4/utils';

export type RichTypes = {
  format?: string;
  variable?: string;
  default?: number | string | boolean;
  reference?: string;
  options?: TypeObject;
};

export const getRichTypes = (type: TypeObject) => {
  const richTypes: RichTypes = {};

  if (!isAnyArray(type.members)) {
    return null;
  }

  type.members.forEach((member) => {
    if (!isModelProperty(member)) {
      return;
    }

    const type = member.value;
    const name = member.name;

    switch (name) {
      case '@ez4/project':
        if (isTypeString(type)) {
          richTypes.format = type.literal;
        }
        break;

      case 'variable':
        if (isTypeString(type)) {
          richTypes.variable = type.literal;
        }
        break;

      case 'default':
        if (isTypeScalar(type)) {
          richTypes.default = type.literal;
        }
        break;

      case 'reference':
        if (isTypeReference(type)) {
          richTypes.reference = type.path;
        }
        break;

      case 'options':
        if (isTypeObject(type)) {
          richTypes.options = type;
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
  const { format, variable, reference, options, default: defaultValue } = richTypes;

  switch (format) {
    case 'variable': {
      return createString('literal', variable && process.env[variable]);
    }

    case 'value': {
      const variableValue = variable ? process.env[variable] : undefined;

      if (isAnyBoolean(defaultValue)) {
        return createBoolean('literal', (variableValue ? variableValue === 'true' : defaultValue) ?? defaultValue);
      }

      if (isAnyNumber(defaultValue)) {
        return createNumber('literal', (variableValue ? parseFloat(variableValue) : undefined) ?? defaultValue);
      }

      return createString('literal', variableValue ?? defaultValue);
    }

    case 'options':
    case 'variables': {
      return createObject('literal', undefined, [
        {
          name: 'reference',
          type: TypeName.Property,
          value: createString('literal', `@${format}`)
        }
      ]);
    }

    case 'service': {
      return createObject('literal', undefined, [
        {
          name: 'reference',
          type: TypeName.Property,
          value: createString('literal', reference)
        },
        {
          name: 'options',
          type: TypeName.Property,
          value: options ?? createNever()
        }
      ]);
    }
  }

  return null;
};
