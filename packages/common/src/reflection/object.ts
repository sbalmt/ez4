import { isTypeObject, type TypeIntersection, type TypeObject } from '@ez4/reflection';
import type { MemberType } from './types.js';

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

export const getIntersectionMembers = (type: TypeIntersection) => {
  const memberList: MemberType[] = [];

  for (const element of type.elements) {
    if (isTypeObject(element)) {
      memberList.push(...getObjectMembers(element));
    }
  }

  return memberList;
};
