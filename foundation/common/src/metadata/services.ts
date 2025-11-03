import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { LinkedServices } from '@ez4/project/library';

import { isModelProperty, isTypeObject } from '@ez4/reflection';
import { triggerAllSync } from '@ez4/project/library';

import { ExternalReferenceError, InvalidServiceError, MissingServiceError, MissingServiceProviderError } from '../errors/services';
import { getPropertyObject, getPropertyString } from '../reflection/property';
import { isExternalDeclaration } from '../reflection/declaration';
import { isClassDeclaration } from '../reflection/model';
import { getObjectMembers } from '../reflection/object';

export const isLinkedService = (member: ModelProperty, reflection: SourceMap) => {
  const referencePath = getPropertyString(member);

  return !!(referencePath && reflection[referencePath]);
};

export const getLinkedServiceList = (member: ModelProperty, reflection: SourceMap, errorList: Error[]) => {
  const object = getPropertyObject(member);

  if (object) {
    return getObjectServices(object, reflection, errorList);
  }

  return undefined;
};

export const getLinkedServiceName = (member: ModelProperty, parent: TypeObject | TypeModel, reflection: SourceMap, errorList: Error[]) => {
  const referencePath = getPropertyString(member);

  if (referencePath?.startsWith('@')) {
    return referencePath;
  }

  const declaration = referencePath && reflection[referencePath];

  if (!declaration) {
    errorList.push(new MissingServiceError(member.name, parent.file));
    return undefined;
  }

  if (!isClassDeclaration(declaration)) {
    errorList.push(new InvalidServiceError(declaration.name, declaration.file));
    return undefined;
  }

  if (isExternalDeclaration(declaration)) {
    errorList.push(new ExternalReferenceError(declaration.name, declaration.file));
    return undefined;
  }

  const serviceName = triggerAllSync('metadata:getLinkedService', (handler) => handler(declaration));

  if (!serviceName) {
    errorList.push(new MissingServiceProviderError(declaration.name, declaration.file));
  }

  return serviceName;
};

const getObjectServices = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeObject(type)) {
    return undefined;
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
