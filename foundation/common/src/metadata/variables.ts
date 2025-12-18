import type { ModelProperty, TypeObject } from '@ez4/reflection';
import type { LinkedVariables } from '@ez4/project/library';

import { isModelProperty } from '@ez4/reflection';

import { MissingVariableError } from '../errors/variables';
import { getPropertyObject, getPropertyString } from '../reflection/property';
import { getObjectMembers } from '../reflection/object';

export const getLinkedVariableList = (member: ModelProperty, errorList: Error[]) => {
  const object = getPropertyObject(member);

  if (object) {
    return getObjectVariables(object, errorList);
  }

  return {};
};

const getObjectVariables = (type: TypeObject, errorList: Error[]) => {
  const members = getObjectMembers(type);
  const variables: LinkedVariables = {};

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    const value = getPropertyString(member);

    if (!value) {
      errorList.push(new MissingVariableError(member.name, type.file));
    } else {
      variables[member.name] = value;
    }
  }

  return variables;
};
