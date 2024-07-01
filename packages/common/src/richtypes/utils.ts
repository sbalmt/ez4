import type { TypeObject } from '@ez4/reflection';

import { createString, isModelProperty, isTypeReference, isTypeString } from '@ez4/reflection';

export type RichTypes = {
  format?: string;

  variable?: string;

  service?: string;
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
  const format = richTypes.format;

  switch (format) {
    case 'variable': {
      return createString('literal', richTypes?.variable && process.env[richTypes.variable]);
    }

    case 'service':
      return createString('literal', richTypes.service);
  }

  return null;
};
