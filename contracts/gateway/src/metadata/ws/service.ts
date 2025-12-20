import type { AllType, SourceMap, TypeClass } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { WsService } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteServiceError } from '../../errors/service';
import { attachSchemaValidationServices } from '../utils/schema';
import { getFullTypeName } from '../utils/type';
import { getWebBodyMetadata } from '../body';
import { createWsService, WsNamespaceType } from './types';
import { getWsConnectionMetadata } from './connection';
import { getWsDefaultsMetadata } from './defaults';
import { getWsMessageMetadata } from './message';

export const isWsServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, getFullTypeName(WsNamespaceType, 'Service'));
};

export const getWsServicesMetadata = (reflection: SourceMap) => {
  const allServices: Record<string, WsService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isWsServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createWsService(declaration.name);
    const properties = new Set(['schema', 'connect', 'disconnect', 'message']);

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
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'client':
          break;

        case 'name':
          if (!member.inherited) {
            service.displayName = getPropertyString(member);
          }
          break;

        case 'stage':
          if (!member.inherited) {
            service.stageName = getPropertyString(member);
          }
          break;

        case 'defaults':
          if (!member.inherited) {
            service.defaults = getWsDefaultsMetadata(member.value, declaration, reflection, errorList);
          }
          break;

        case 'schema':
          if ((service.schema = getWebBodyMetadata(member.value, declaration, reflection, errorList, WsNamespaceType))) {
            properties.delete(member.name);
          }
          break;

        case 'connect':
        case 'disconnect':
          if (!member.inherited && (service[member.name] = getWsConnectionMetadata(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'message':
          if (!member.inherited && (service[member.name] = getWsMessageMetadata(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'variables':
          if (!member.inherited) {
            service.variables = getLinkedVariableList(member, errorList);
          } else {
            service.variables = {};
          }
          break;

        case 'services':
          if (!member.inherited) {
            service.services = getLinkedServiceList(member, reflection, errorList);
          } else {
            service.services = {};
          }
          break;
      }
    }

    if (!isCompleteService(service)) {
      errorList.push(new IncompleteServiceError([...properties], fileName));
      continue;
    }

    if (allServices[declaration.name]) {
      errorList.push(new DuplicateServiceError(declaration.name, fileName));
      continue;
    }

    attachLinkedServices(service);

    allServices[declaration.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isCompleteService = (type: Incomplete<WsService>): type is WsService => {
  return isObjectWith(type, ['schema', 'connect', 'disconnect', 'message', 'variables', 'services']);
};

const attachLinkedServices = (service: WsService) => {
  for (const route of [service.connect, service.disconnect, service.message]) {
    const { request } = route.handler;

    if (!request) {
      continue;
    }

    const { identity, body } = request;

    if ('headers' in request && request.headers) {
      attachSchemaValidationServices(service.services, request.headers);
    }

    if ('query' in request && request.query) {
      attachSchemaValidationServices(service.services, request.query);
    }

    if (identity) {
      attachSchemaValidationServices(service.services, identity);
    }

    if (body) {
      attachSchemaValidationServices(service.services, body);
    }
  }
};
