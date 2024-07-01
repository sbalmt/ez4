import type { Incomplete } from '@ez4/utils';
import type { AllType, EveryMemberType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { QueueSubscription } from '../types/subscription.js';

import { getLinkedVariables, getModelMembers, getObjectMembers } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteSubscriptionError } from '../errors/subscription.js';
import { getSubscriptionHandler } from './handler.js';
import { isQueueSubscription } from './utils.js';

export const getQueueSubscription = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeSubscription(type, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeSubscription(statement, reflection, errorList);
  }

  return null;
};

const isValidSubscription = (type: Incomplete<QueueSubscription>): type is QueueSubscription => {
  return !!type.handler;
};

const getTypeSubscription = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (isQueueSubscription(type)) {
    return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  return null;
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: EveryMemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const subscription: Incomplete<QueueSubscription> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    switch (member.name) {
      case 'handler': {
        if ((subscription.handler = getSubscriptionHandler(member.value, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'variables':
        subscription.variables = getLinkedVariables(member, errorList);
        break;
    }
  }

  if (isValidSubscription(subscription)) {
    return subscription;
  }

  errorList.push(new IncompleteSubscriptionError([...properties], type.file));

  return null;
};
