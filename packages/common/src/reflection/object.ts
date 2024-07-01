import type { EveryMemberType, TypeObject } from '@ez4/reflection';

export const getObjectMembers = (type: TypeObject) => {
  const memberList: EveryMemberType[] = [];

  type.members?.forEach((member) => {
    memberList.push(member);
  });

  return memberList;
};
