import type { TypeIntersection } from '@ez4/reflection';
import type { MemberType } from './types';

import { isTypeModel, isTypeObject } from '@ez4/reflection';

import { getObjectMembers } from './object';
import { getModelMembers } from './model';

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
