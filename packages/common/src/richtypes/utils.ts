import type { TypeObject } from '@ez4/reflection';

import { createBoolean, createNumber, createString, isModelProperty, isTypeReference, isTypeScalar, isTypeString } from '@ez4/reflection';
import { isAnyBoolean, isAnyNumber } from '@ez4/utils';

export type RichTypes = {
  format?: string;
  variable?: string;
  default?: number | string | boolean;
  service?: string;
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

      case 'service':
        if (isTypeReference(type)) {
          richTypes.service = type.path;
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
  const { format, variable, service, default: defaultValue } = richTypes;

  switch (format) {
    case 'variable': {
      return createString('literal', variable && process.env[variable]);
    }

    case 'service':
      return createString('literal', service);

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
  }

  return null;
};
