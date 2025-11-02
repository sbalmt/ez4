import type { SourceMap, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { TopicService } from '../types/service';

import {
  DuplicateServiceError,
  isExternalDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  InvalidServicePropertyError
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { hasSchemaProperty } from '@ez4/schema';

import { ServiceType } from '../types/service';
import { IncompleteServiceError } from '../errors/service';
import { IncorrectFifoModePropertyError } from '../errors/fifo';
import { getAllSubscription } from './subscription';
import { getTopicMessage } from './message';
import { getTopicFifoMode } from './fifo';
import { isTopicService } from './utils';

export const getTopicServices = (reflection: SourceMap) => {
  const allServices: Record<string, TopicService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isTopicService(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service: Incomplete<TopicService> = { type: ServiceType, context: {} };
    const properties = new Set(['subscriptions', 'schema']);

    const fileName = declaration.file;

    service.name = declaration.name;

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
          if ((service.schema = getTopicMessage(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'subscriptions':
          if (!member.inherited && (service.subscriptions = getAllSubscription(member, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'fifoMode':
          if (!member.inherited) {
            service.fifoMode = getTopicFifoMode(member.value, declaration, reflection, errorList);
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

const isValidService = (type: Incomplete<TopicService>): type is TopicService => {
  return !!type.name && !!type.schema && !!type.subscriptions && !!type.context;
};

const validateFifoModeProperties = (parent: TypeModel, service: TopicService) => {
  const { fifoMode } = service;

  if (fifoMode && !hasSchemaProperty(service.schema, fifoMode.groupId)) {
    return [new IncorrectFifoModePropertyError([fifoMode.groupId], parent.file)];
  }

  return [];
};
