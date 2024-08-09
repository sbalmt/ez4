import type { EveryType, TypeObject } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';

import { isModelProperty, isTypeString } from '@ez4/reflection';

export type RichTypes = {
  index?: string;
  type: EveryType;
};

const isValidRichTypes = (richTypes: Incomplete<RichTypes>): richTypes is RichTypes => {
  return !!richTypes.index && !!richTypes.type;
};

export const getRichTypes = (type: TypeObject) => {
  const richType: Incomplete<RichTypes> = {};

  type.members?.forEach((member) => {
    if (!isModelProperty(member)) {
      return;
    }

    const type = member.value;
    const name = member.name;

    switch (name) {
      case '@ez4/database':
        if (isTypeString(type)) {
          richType.index = type.literal;
        }
        break;

      case 'type':
        richType.type = type;
        break;
    }
  });

  if (isValidRichTypes(richType)) {
    return richType;
  }

  return null;
};

export const createRichType = (richType: RichTypes) => {
  const index = richType.index;

  switch (index) {
    case 'primary':
    case 'regular':
      return {
        ...richType.type,
        extra: {
          index
        }
      };
  }

  return null;
};
