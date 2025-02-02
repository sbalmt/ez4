import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { NotificationSubscription } from '../types/common.js';

import {
  getLinkedVariableList,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyTuple,
  isModelDeclaration
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import {
  IncompleteSubscriptionError,
  IncorrectSubscriptionTypeError,
  InvalidSubscriptionTypeError
} from '../errors/subscription.js';

import { getSubscriptionHandler } from './handler.js';
import { isNotificationSubscription } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getAllSubscription = (
  member: ModelProperty,
  parent: TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
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

const getNotificationSubscription = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeSubscription(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeSubscription(statement, parent, reflection, errorList);
  }

  return null;
};

const isValidSubscription = (
  type: Incomplete<NotificationSubscription>
): type is NotificationSubscription => {
  return !!type.handler;
};

const getTypeSubscription = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidSubscriptionTypeError(parent.file));
    return null;
  }

  if (!isNotificationSubscription(type)) {
    errorList.push(new IncorrectSubscriptionTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const subscription: Incomplete<NotificationSubscription> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'handler': {
        if ((subscription.handler = getSubscriptionHandler(member.value, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'memory':
      case 'concurrency': {
        const value = getPropertyNumber(member);
        if (isAnyNumber(value)) {
          subscription[member.name] = value;
        }
        break;
      }

      case 'variables':
        subscription.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (isValidSubscription(subscription)) {
    return subscription;
  }

  errorList.push(new IncompleteSubscriptionError([...properties], type.file));

  return null;
};
