import type { AllType, ReflectionTypes, TypeClass, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { QueueService } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyNumber,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { hasSchemaProperty } from '@ez4/schema';
import { isObjectWith } from '@ez4/utils';

import { createQueueService } from './types';
import { IncompleteServiceError } from '../errors/service';
import { IncorrectFifoModePropertyError } from '../errors/fifo';
import { attachValidatorLinkedServices } from './utils/validator';
import { getQueueSubscriptionsMetadata } from './subscription';
import { getQueueDeadLetterMetadata } from './deadletter';
import { getQueueMessageMetadata } from './message';
import { getQueueFifoModeMetadata } from './fifo';

export const isQueueServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Queue.Service');
};

export const getQueueServicesMetadata = (reflection: ReflectionTypes) => {
  const allServices: Record<string, QueueService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isQueueServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createQueueService(declaration.name);
    const properties = new Set(['schema', 'subscriptions']);

    if (declaration.description) {
      service.description = declaration.description;
    }

    const fileName = declaration.file;

    for (const member of getModelMembers(declaration, true)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        default: {
          if (!member.inherited) {
            errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          }
          break;
        }

        case 'client':
          break;

        case 'schema': {
          if ((service.schema = getQueueMessageMetadata(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'timeout':
        case 'retention':
        case 'polling':
        case 'delay': {
          if (!member.inherited) {
            service[member.name] = getPropertyNumber(member);
          }
          break;
        }

        case 'fifoMode': {
          if (!member.inherited) {
            service.fifoMode = getQueueFifoModeMetadata(member.value, declaration, reflection, errorList);
          }
          break;
        }

        case 'deadLetter': {
          if (!member.inherited) {
            service.deadLetter = getQueueDeadLetterMetadata(member.value, declaration, reflection, errorList);
          }
          break;
        }

        case 'subscriptions': {
          if (!member.inherited && (service.subscriptions = getQueueSubscriptionsMetadata(member, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'variables': {
          if (!member.inherited) {
            service.variables = getLinkedVariableList(member, errorList);
          }
          break;
        }

        case 'services': {
          if (!member.inherited) {
            service.services = getLinkedServiceList(member, reflection, errorList);
          }
          break;
        }
      }
    }

    if (!isCompleteService(service)) {
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

    attachValidatorLinkedServices(service.schema, service.services);

    allServices[declaration.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isCompleteService = (type: Incomplete<QueueService>): type is QueueService => {
  return isObjectWith(type, ['schema', 'subscriptions', 'variables', 'services']);
};

const validateFifoModeProperties = (parent: TypeModel, service: QueueService) => {
  const { fifoMode } = service;

  if (fifoMode && !hasSchemaProperty(service.schema, fifoMode.groupId)) {
    return [new IncorrectFifoModePropertyError([fifoMode.groupId], parent.file)];
  }

  return [];
};
