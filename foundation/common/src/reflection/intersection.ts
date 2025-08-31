import type { TypeIntersection } from '@ez4/reflection';
import type { MemberType } from './types.js';

import { isTypeModel, isTypeObject } from '@ez4/reflection';

import { getObjectMembers } from './object.js';
import { getModelMembers } from './model.js';

export const getIntersectionMembers = (type: TypeIntersection) => {
  const memberList: MemberType[] = [];

  for (const element of type.elements) {
    if (isTypeObject(element)) {
      memberList.push(...getObjectMembers(element));
    } else if (isTypeModel(element)) {
      memberList.push(...getModelMembers(element));
    }
  }

  return memberList;
};
