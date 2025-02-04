import type { SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { QueueService } from '../types/service.js';

import {
  DuplicateServiceError,
  isExternalStatement,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyNumber,
  InvalidServicePropertyError
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getAllSubscription } from './subscription.js';
import { getQueueMessage } from './message.js';
import { isQueueService } from './utils.js';

export const getQueueServices = (reflection: SourceMap) => {
  const queueServices: Record<string, QueueService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isQueueService(statement) || isExternalStatement(statement)) {
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
        case 'schema': {
          service.schema = getQueueMessage(member.value, statement, reflection, errorList);
          if (service.schema) {
            properties.delete(member.name);
          }
          break;
        }

        case 'timeout':
        case 'retention':
        case 'polling':
        case 'delay': {
          if (!member.inherited) {
            const value = getPropertyNumber(member);
            if (isAnyNumber(value)) {
              service[member.name] = value;
            }
          }
          break;
        }

        case 'subscriptions': {
          if (!member.inherited) {
            service.subscriptions = getAllSubscription(member, statement, reflection, errorList);
            if (service.subscriptions) {
              properties.delete(member.name);
            }
          }
          break;
        }

        case 'variables':
          if (!member.inherited) {
            service.variables = getLinkedVariableList(member, errorList);
          }
          break;

        case 'services':
          if (!member.inherited) {
            service.services = getLinkedServiceList(member, reflection, errorList);
          }
          break;

        default:
          if (!member.inherited) {
            errorList.push(
              new InvalidServicePropertyError(statement.name, member.name, statement.file)
            );
          }
          break;
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], statement.file));
      continue;
    }

    if (queueServices[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, statement.file));
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
