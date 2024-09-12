import type { Incomplete } from '@ez4/utils';
import type { ModelProperty, SourceMap } from '@ez4/reflection';
import type { QueueSubscription } from '../types/subscription.js';
import type { QueueService } from '../types/service.js';

import {
  getLinkedServices,
  getLinkedVariables,
  getModelMembers,
  getPropertyNumber,
  getPropertyTuple
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getQueueSubscription } from './subscription.js';
import { getQueueMessage } from './message.js';
import { isQueueService } from './utils.js';

export const getQueueServices = (reflection: SourceMap) => {
  const queueServices: Record<string, QueueService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isQueueService(statement)) {
      continue;
    }

    const service: Incomplete<QueueService> = { type: ServiceType };
    const properties = new Set(['subscriptions', 'schema']);

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement, true)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        case 'schema':
          if ((service.schema = getQueueMessage(member.value, statement, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'timeout':
        case 'retention':
        case 'delay': {
          if (!member.inherited) {
            const value = getPropertyNumber(member);
            if (value !== undefined && value !== null) {
              service[member.name] = value;
            }
          }
          break;
        }

        case 'subscriptions': {
          if (!member.inherited) {
            if ((service.subscriptions = getAllSubscription(member, reflection, errorList))) {
              properties.delete(member.name);
            }
          }
          break;
        }

        case 'variables':
          if (!member.inherited) {
            service.variables = getLinkedVariables(member, errorList);
          }
          break;

        case 'services':
          if (!member.inherited) {
            service.services = getLinkedServices(member, reflection, errorList);
          }
          break;
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], statement.file));
      continue;
    }

    queueServices[statement.name] = service;
  }

  return {
    services: queueServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<QueueService>): type is QueueService => {
  return !!type.name && !!type.schema && !!type.subscriptions;
};

const getAllSubscription = (member: ModelProperty, reflection: SourceMap, errorList: Error[]) => {
  const subscriptionItems = getPropertyTuple(member) ?? [];
  const subscriptionList: QueueSubscription[] = [];

  for (const subscription of subscriptionItems) {
    const result = getQueueSubscription(subscription, reflection, errorList);

    if (result) {
      subscriptionList.push(result);
    }
  }

  return subscriptionList;
};
