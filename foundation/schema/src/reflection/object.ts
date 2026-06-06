import type { ModelProperty, TypeObject } from '@ez4/reflection';

import { isModelProperty } from '@ez4/reflection';
import { isAnyArray } from '@ez4/utils';

export const getObjectProperties = (type: TypeObject) => {
  const memberList: ModelProperty[] = [];

  if (isAnyArray(type.members)) {
    type.members.forEach((member) => {
      if (isModelProperty(member)) {
        memberList.push(member);
      }
    });
  }

  return memberList;
};
