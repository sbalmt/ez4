import type { AllType, ModelProperty, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { TopicSubscription } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLinkedServiceName,
  getLinkedVariableList,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyTuple,
  getServiceListener,
  getServiceArchitecture,
  getServiceRuntime,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteSubscriptionError, IncorrectSubscriptionTypeError, InvalidSubscriptionTypeError } from '../errors/subscription';
import { getSubscriptionHandlerMetadata } from './handler';
import { TopicSubscriptionType } from './types';

export const isTopicSubscriptionDeclaration = (type: AllType) => {
  if (isModelDeclaration(type)) {
    return hasHeritageType(type, 'Topic.QueueSubscription') || hasHeritageType(type, 'Topic.LambdaSubscription');
  }

  return false;
};

export const getAllSubscriptionMetadata = (member: ModelProperty, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  const subscriptionItems = getPropertyTuple(member) ?? [];
  const resultList: TopicSubscription[] = [];

  for (const subscription of subscriptionItems) {
    const result = getTopicSubscription(subscription, parent, reflection, errorList);

    if (result) {
      resultList.push(result);
    }
  }

  return resultList;
};

const getTopicSubscription = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeSubscription(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeSubscription(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isValidSubscription = (type: Incomplete<TopicSubscription>): type is TopicSubscription => {
  switch (type.type) {
    case TopicSubscriptionType.Lambda:
      return !!type.handler;

    case TopicSubscriptionType.Queue:
      return !!type.service;
  }

  return false;
};

const getTypeSubscription = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidSubscriptionTypeError(parent.file));
    return undefined;
  }

  if (!isTopicSubscriptionDeclaration(type)) {
    errorList.push(new IncorrectSubscriptionTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const allLambdaErrors: Error[] = [];
  const allQueueErrors: Error[] = [];

  let subscription;

  if ((subscription = getLambdaSubscription(type, parent, members, reflection, allLambdaErrors))) {
    errorList.push(...allLambdaErrors);
    return subscription;
  }

  if ((subscription = getQueueSubscription(type, parent, members, reflection, allQueueErrors))) {
    errorList.push(...allQueueErrors);
    return subscription;
  }

  errorList.push(...allLambdaErrors, ...allQueueErrors);

  return undefined;
};

const getLambdaSubscription = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const subscription: Incomplete<TopicSubscription> = {
    type: TopicSubscriptionType.Lambda
  };

  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'handler':
        if ((subscription.handler = getSubscriptionHandlerMetadata(member.value, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'memory':
      case 'logRetention':
      case 'timeout':
        subscription[member.name] = getPropertyNumber(member);
        break;

      case 'architecture':
        subscription[member.name] = getServiceArchitecture(member);
        break;

      case 'runtime':
        subscription[member.name] = getServiceRuntime(member);
        break;

      case 'listener':
        subscription.listener = getServiceListener(member.value, errorList);
        break;

      case 'variables':
        subscription.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (properties.size === 0 && isValidSubscription(subscription)) {
    return subscription;
  }

  errorList.push(new IncompleteSubscriptionError([...properties], type.file));

  return undefined;
};

const getQueueSubscription = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const subscription: Incomplete<TopicSubscription> = {
    type: TopicSubscriptionType.Queue
  };

  const properties = new Set(['service']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'service':
        if ((subscription.service = getLinkedServiceName(member, parent, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
    }
  }

  if (properties.size === 0 && isValidSubscription(subscription)) {
    return subscription;
  }

  errorList.push(new IncompleteSubscriptionError([...properties], type.file));

  return undefined;
};
