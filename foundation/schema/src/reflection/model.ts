import type { ModelProperty, TypeModel } from '@ez4/reflection';

import { isModelProperty } from '@ez4/reflection';

export const getModelProperties = (type: TypeModel) => {
  const membersMap = new Map<string, ModelProperty>();

  type.heritage?.forEach((heritage) => {
    heritage.members?.forEach((member) => {
      if (isModelProperty(member)) {
        membersMap.set(member.name, member);
      }
    });
  });

  type.members?.forEach((member) => {
    if (isModelProperty(member)) {
      membersMap.set(member.name, member);
    }
  });

  return [...membersMap.values()];
};
