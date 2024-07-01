import type { ModelProperty, TypeObject } from '@ez4/reflection';

import { isModelProperty } from '@ez4/reflection';

export const getObjectProperties = (type: TypeObject) => {
  const memberList: ModelProperty[] = [];

  type.members?.forEach((member) => {
    if (isModelProperty(member)) {
      memberList.push(member);
    }
  });

  return memberList;
};
