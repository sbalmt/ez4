import type { AllType, ModelProperty, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { QueueSubscription } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLinkedVariableList,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyTuple,
  getServiceListener,
  getServiceArchitecture,
  getServiceRuntime,
  getPropertyBoolean,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteSubscriptionError, IncorrectSubscriptionTypeError, InvalidSubscriptionTypeError } from '../errors/subscription';
import { getSubscriptionHandlerMetadata } from './handler';

export const isQueueSubscriptionDeclaration = (type: AllType) => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Queue.Subscription');
};

export const getQueueSubscriptionsMetadata = (
  member: ModelProperty,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const subscriptionItems = getPropertyTuple(member) ?? [];
  const resultList: QueueSubscription[] = [];

  for (const subscription of subscriptionItems) {
    const result = getQueueSubscription(subscription, parent, reflection, errorList);

    if (result) {
      resultList.push(result);
    }
  }

  return resultList;
};

const getQueueSubscription = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getSubscriptionType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getSubscriptionType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isCompleteSubscription = (type: Incomplete<QueueSubscription>): type is QueueSubscription => {
  return isObjectWith(type, ['handler']);
};

const getSubscriptionType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidSubscriptionTypeError(parent.file));
    return undefined;
  }

  if (!isQueueSubscriptionDeclaration(type)) {
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
  const subscription: Incomplete<QueueSubscription> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'handler': {
        if ((subscription.handler = getSubscriptionHandlerMetadata(member.value, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'memory':
      case 'logRetention':
      case 'concurrency':
      case 'batch': {
        subscription[member.name] = getPropertyNumber(member);
        break;
      }

      case 'architecture': {
        subscription[member.name] = getServiceArchitecture(member);
        break;
      }

      case 'runtime': {
        subscription[member.name] = getServiceRuntime(member);
        break;
      }

      case 'vpc': {
        subscription[member.name] = getPropertyBoolean(member);
        break;
      }

      case 'listener': {
        subscription.listener = getServiceListener(member.value, errorList);
        break;
      }

      case 'variables': {
        subscription.variables = getLinkedVariableList(member, errorList);
        break;
      }
    }
  }

  if (!isCompleteSubscription(subscription)) {
    errorList.push(new IncompleteSubscriptionError([...properties], type.file));
    return undefined;
  }

  return subscription;
};
