import type { EveryMemberType, ModelProperty, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { LinkedServices } from '@ez4/project/library';

import { triggerAllSync } from '@ez4/project/library';
import { isModelProperty } from '@ez4/reflection';
import { isAnyArray } from '@ez4/utils';

import { ExternalReferenceError, InvalidServiceError, MissingServiceError, MissingServiceProviderError } from '../errors/services';
import { getPropertyObject, getPropertyString } from '../reflection/property';
import { getObjectMembers, getPlainObject } from '../reflection/object';
import { isExternalDeclaration } from '../reflection/declaration';
import { isClassDeclaration } from '../reflection/model';

export const isLinkedService = (member: ModelProperty, reflection: ReflectionTypes) => {
  const referencePath = getPropertyString(member);

  return !!(referencePath && reflection[referencePath]);
};

export const getLinkedServicesObject = (member: ModelProperty, reflection: ReflectionTypes, errorList: Error[]) => {
  const object = getPropertyObject(member);

  if (!object) {
    return {};
  }

  const members = getObjectMembers(object);
  const services: LinkedServices = {};

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    const service = getLinkedServiceObject(member, reflection, errorList);

    if (!service) {
      errorList.push(new MissingServiceError(member.name, object.file));
      continue;
    }

    services[member.name] = service;
  }

  return services;
};

export const getLinkedServiceObject = (member: ModelProperty, reflection: ReflectionTypes, errorList: Error[]) => {
  const object = getPropertyObject(member);
  const members = object?.members;

  if (!object || !isAnyArray(members)) {
    return undefined;
  }

  const referenceMember = members.find(({ name }) => name === 'reference');
  const optionsMember = members.find(({ name }) => name === 'options');

  if (!referenceMember || !isModelProperty(referenceMember)) {
    return undefined;
  }

  const reference = getObjectServiceName(referenceMember, object, reflection, errorList);

  if (!reference) {
    return undefined;
  }

  const options = optionsMember && getObjectServiceOptions(optionsMember);

  return {
    reference,
    ...(options && {
      options
    })
  };
};

const getObjectServiceName = (member: ModelProperty, parent: TypeObject | TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  const referencePath = getPropertyString(member);

  if (referencePath?.startsWith('@')) {
    return referencePath;
  }

  const declaration = referencePath && reflection[referencePath];

  if (!declaration) {
    errorList.push(new MissingServiceError(member.name, parent.file));
    return undefined;
  }

  if (isExternalDeclaration(declaration)) {
    errorList.push(new ExternalReferenceError(declaration.name, parent.file));
    return undefined;
  }

  if (!isClassDeclaration(declaration)) {
    errorList.push(new InvalidServiceError(declaration.name, declaration.file));
    return undefined;
  }

  const serviceName = triggerAllSync('metadata:getLinkedService', (handler) => handler(declaration));

  if (!serviceName) {
    errorList.push(new MissingServiceProviderError(declaration.name, declaration.file));
  }

  return serviceName;
};

const getObjectServiceOptions = (member: EveryMemberType) => {
  if (isModelProperty(member)) {
    const optionsObject = getPropertyObject(member);

    if (optionsObject) {
      return getPlainObject(optionsObject);
    }
  }

  return undefined;
};
