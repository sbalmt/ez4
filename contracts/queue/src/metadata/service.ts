import type { SourceMap, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { QueueService } from '../types/service';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyNumber
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { hasSchemaProperty } from '@ez4/schema';

import { ServiceType } from '../types/service';
import { IncompleteServiceError } from '../errors/service';
import { IncorrectFifoModePropertyError } from '../errors/fifo';
import { getQueueDeadLetter } from './deadletter';
import { getAllSubscription } from './subscription';
import { getQueueMessage } from './message';
import { getQueueFifoMode } from './fifo';
import { isQueueService } from './utils';

export const getQueueServices = (reflection: SourceMap) => {
  const allServices: Record<string, QueueService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isQueueService(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service: Incomplete<QueueService> = { type: ServiceType, extras: {} };
    const properties = new Set(['subscriptions', 'schema']);

    service.name = declaration.name;

    if (declaration.description) {
      service.description = declaration.description;
    }

    const fileName = declaration.file;

    for (const member of getModelMembers(declaration, true)) {
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
          if ((service.schema = getQueueMessage(member.value, declaration, reflection, errorList))) {
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
            service.fifoMode = getQueueFifoMode(member.value, declaration, reflection, errorList);
          }
          break;

        case 'deadLetter':
          if (!member.inherited) {
            service.deadLetter = getQueueDeadLetter(member.value, declaration, reflection, errorList);
          }
          break;

        case 'subscriptions': {
          if (!member.inherited && (service.subscriptions = getAllSubscription(member, declaration, reflection, errorList))) {
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

    const validationErrors = validateFifoModeProperties(declaration, service);

    if (validationErrors.length) {
      errorList.push(...validationErrors);
      continue;
    }

    if (allServices[declaration.name]) {
      errorList.push(new DuplicateServiceError(declaration.name, fileName));
      continue;
    }

    allServices[declaration.name] = service;
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
