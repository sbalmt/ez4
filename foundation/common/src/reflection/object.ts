import type { TypeObject } from '@ez4/reflection';
import type { AnyObject } from '@ez4/utils';
import type { MemberType } from './types';

import { isModelProperty, isTypeObject, isTypeScalar, isTypeTuple } from '@ez4/reflection';
import { getPlainArray } from './array';

export const getObjectMembers = (type: TypeObject) => {
  const memberList: MemberType[] = [];

  if (Array.isArray(type.members)) {
    type.members.forEach((member) => {
      memberList.push({
        ...member,
        inherited: false
      });
    });
  }

  return memberList;
};

export const getPlainObject = (object: TypeObject) => {
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
    } else {
      result[name] = undefined;
    }
  }

  return result;
};
