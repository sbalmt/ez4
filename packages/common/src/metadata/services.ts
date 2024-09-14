import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { LinkedServices } from '@ez4/project/library';

import { isModelProperty, isTypeObject } from '@ez4/reflection';
import { triggerAllSync } from '@ez4/project/library';

import {
  InvalidServiceError,
  MissingServiceError,
  MissingServiceProviderError
} from '../errors/services.js';

import { getPropertyObject, getPropertyString } from '../reflection/property.js';
import { isClassDeclaration } from '../reflection/model.js';
import { getObjectMembers } from '../reflection/object.js';

export const getLinkedServiceList = (
  member: ModelProperty,
  reflection: SourceMap,
  errorList: Error[]
) => {
  const object = getPropertyObject(member);

  if (object) {
    return getObjectServices(object, reflection, errorList);
  }

  return null;
};

export const getLinkedServiceName = (
  member: ModelProperty,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
): string | null => {
  const referencePath = getPropertyString(member);

  const statement = referencePath && reflection[referencePath];

  if (!statement) {
    errorList.push(new MissingServiceError(member.name, parent.file));
    return null;
  }

  if (!isClassDeclaration(statement)) {
    errorList.push(new InvalidServiceError(statement.name, statement.file));
    return null;
  }

  const service = triggerAllSync('metadata:getLinkedService', (handler) => handler(statement));

  if (!service) {
    errorList.push(new MissingServiceProviderError(statement.name, statement.file));
  }

  return service;
};

const getObjectServices = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeObject(type)) {
    return null;
  }

  const members = getObjectMembers(type);
  const linkedServices: LinkedServices = {};

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    const service = getLinkedServiceName(member, type, reflection, errorList);

    if (service) {
      linkedServices[member.name] = service;
    }
  }

  return linkedServices;
};
