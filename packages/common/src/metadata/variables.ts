import type { AllType, ModelProperty } from '@ez4/reflection';
import type { LinkedVariables } from '@ez4/project/library';

import { isModelProperty, isTypeObject } from '@ez4/reflection';

import { MissingVariableError } from '../errors/variables.js';
import { getPropertyObject, getPropertyString } from '../reflection/property.js';
import { getObjectMembers } from '../reflection/object.js';

export const getLinkedVariableList = (member: ModelProperty, errorList: Error[]) => {
  const object = getPropertyObject(member);

  if (object) {
    return getObjectVariables(object, errorList);
  }

  return null;
};

const getObjectVariables = (type: AllType, errorList: Error[]) => {
  if (!isTypeObject(type)) {
    return null;
  }

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
