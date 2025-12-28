import type { AllType, ReflectionTypes, TypeClass, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { TopicService } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { hasSchemaProperty } from '@ez4/schema';
import { isObjectWith } from '@ez4/utils';

import { createTopicService } from './types';
import { IncompleteServiceError } from '../errors/service';
import { IncorrectFifoModePropertyError } from '../errors/fifo';
import { getAllSubscriptionMetadata } from './subscription';
import { getTopicMessageMetadata } from './message';
import { getTopicFifoModeMetadata } from './fifo';

export const isTopicServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Topic.Service');
};

export const getTopicServicesMetadata = (reflection: ReflectionTypes) => {
  const allServices: Record<string, TopicService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isTopicServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createTopicService(declaration.name);
    const properties = new Set(['schema', 'subscriptions']);

    const fileName = declaration.file;

    if (declaration.description) {
      service.description = declaration.description;
    }

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
          if ((service.schema = getTopicMessageMetadata(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'subscriptions':
          if (!member.inherited && (service.subscriptions = getAllSubscriptionMetadata(member, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'fifoMode':
          if (!member.inherited) {
            service.fifoMode = getTopicFifoModeMetadata(member.value, declaration, reflection, errorList);
          }
          break;

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

    allServices[declaration.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isCompleteService = (type: Incomplete<TopicService>): type is TopicService => {
  return isObjectWith(type, ['schema', 'subscriptions', 'variables', 'services']);
};

const validateFifoModeProperties = (parent: TypeModel, service: TopicService) => {
  const { fifoMode } = service;

  if (fifoMode && !hasSchemaProperty(service.schema, fifoMode.groupId)) {
    return [new IncorrectFifoModePropertyError([fifoMode.groupId], parent.file)];
  }

  return [];
};
