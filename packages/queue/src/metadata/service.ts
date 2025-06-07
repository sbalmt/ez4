import type { SourceMap, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { QueueService } from '../types/service.js';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalStatement,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyNumber
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { hasSchemaProperty } from '@ez4/schema';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { IncorrectFifoModePropertyError } from '../errors/fifo.js';
import { getAllSubscription } from './subscription.js';
import { getQueueMessage } from './message.js';
import { getQueueFifoMode } from './fifo.js';
import { isQueueService } from './utils.js';

export const getQueueServices = (reflection: SourceMap) => {
  const allServices: Record<string, QueueService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isQueueService(statement) || isExternalStatement(statement)) {
      continue;
    }

    const service: Incomplete<QueueService> = { type: ServiceType, extras: {} };
    const properties = new Set(['subscriptions', 'schema']);

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    const fileName = statement.file;

    for (const member of getModelMembers(statement, true)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        default:
          if (!member.inherited) {
            errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          }
          break;

        case 'client':
          break;

        case 'schema':
          if ((service.schema = getQueueMessage(member.value, statement, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'timeout':
        case 'retention':
        case 'polling':
        case 'delay':
          if (!member.inherited) {
            service[member.name] = getPropertyNumber(member);
          }
          break;

        case 'fifoMode':
          if (!member.inherited) {
            service.fifoMode = getQueueFifoMode(member.value, statement, reflection, errorList);
          }
          break;

        case 'subscriptions': {
          if (!member.inherited && (service.subscriptions = getAllSubscription(member, statement, reflection, errorList))) {
            properties.delete(member.name);
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
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], fileName));
      continue;
    }

    const validationErrors = validateFifoModeProperties(statement, service);

    if (validationErrors.length) {
      errorList.push(...validationErrors);
      continue;
    }

    if (allServices[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, fileName));
      continue;
    }

    allServices[statement.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<QueueService>): type is QueueService => {
  return !!type.name && !!type.schema && !!type.subscriptions && !!type.extras;
};

const validateFifoModeProperties = (parent: TypeModel, service: QueueService) => {
  const { fifoMode } = service;

  if (fifoMode && !hasSchemaProperty(service.schema, fifoMode.groupId)) {
    return [new IncorrectFifoModePropertyError([fifoMode.groupId], parent.file)];
  }

  return [];
};
