import type { TypeObject } from '@ez4/reflection';
import type { MemberType } from './types.js';

export const getObjectMembers = (type: TypeObject) => {
  const memberList: MemberType[] = [];

  type.members?.forEach((member) => {
    memberList.push({
      ...member,
      inherited: false
    });
  });

  return memberList;
};
