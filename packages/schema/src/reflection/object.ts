import type { ModelProperty, TypeObject } from '@ez4/reflection';

import { isModelProperty } from '@ez4/reflection';

export const getObjectProperties = (type: TypeObject) => {
  const memberList: ModelProperty[] = [];

  if (Array.isArray(type.members)) {
    type.members.forEach((member) => {
      if (isModelProperty(member)) {
        memberList.push(member);
      }
    });
  }

  return memberList;
};
