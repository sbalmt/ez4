import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { NotificationSubscription } from '../types/common.js';

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
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteSubscriptionError, IncorrectSubscriptionTypeError, InvalidSubscriptionTypeError } from '../errors/subscription.js';
import { NotificationSubscriptionType } from '../types/common.js';
import { isNotificationSubscription } from './utils.js';
import { getSubscriptionHandler } from './handler.js';

export const getAllSubscription = (member: ModelProperty, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  const subscriptionItems = getPropertyTuple(member) ?? [];
  const resultList: NotificationSubscription[] = [];

  for (const subscription of subscriptionItems) {
    const result = getNotificationSubscription(subscription, parent, reflection, errorList);

    if (result) {
      resultList.push(result);
    }
  }

  return resultList;
};

const getNotificationSubscription = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeSubscription(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeSubscription(declaration, parent, reflection, errorList);
  }

  return null;
};

const isValidSubscription = (type: Incomplete<NotificationSubscription>): type is NotificationSubscription => {
  switch (type.type) {
    case NotificationSubscriptionType.Lambda:
      return !!type.handler;

    case NotificationSubscriptionType.Queue:
      return !!type.service;
  }

  return false;
};

const getTypeSubscription = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidSubscriptionTypeError(parent.file));
    return null;
  }

  if (!isNotificationSubscription(type)) {
    errorList.push(new IncorrectSubscriptionTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: SourceMap,
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

  return null;
};

const getLambdaSubscription = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const subscription: Incomplete<NotificationSubscription> = {
    type: NotificationSubscriptionType.Lambda
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
        if ((subscription.handler = getSubscriptionHandler(member.value, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'memory':
      case 'logRetention':
      case 'timeout':
        subscription[member.name] = getPropertyNumber(member);
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

  return null;
};

const getQueueSubscription = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const subscription: Incomplete<NotificationSubscription> = {
    type: NotificationSubscriptionType.Queue
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

  return null;
};
