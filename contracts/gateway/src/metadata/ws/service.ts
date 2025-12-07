import type { AllType, SourceMap, TypeClass } from '@ez4/reflection';
import type { WsService } from './types';

import {
  DuplicateServiceError,
  isExternalDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString,
  InvalidServicePropertyError,
  isClassDeclaration,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { IncompleteServiceError } from '../../errors/http/service';
import { getPartialWsService, isCompleteWsService } from './types';
import { getWsConnection } from './connection';
import { getWsMessage } from './message';
import { getWsEvent } from './event';

export const isWsServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Ws.Service');
};

export const getWsServices = (reflection: SourceMap) => {
  const allServices: Record<string, WsService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isWsServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = getPartialWsService();
    const properties = new Set(['routeKey', 'schema', 'connect', 'disconnect', 'message']);

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
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'client':
          break;

        case 'name':
          if (!member.inherited) {
            service.displayName = getPropertyString(member);
          }
          break;

        case 'routeKey':
          if ((service[member.name] = getPropertyString(member))) {
            properties.delete(member.name);
          }
          break;

        case 'schema':
          if ((service.schema = getWsEvent(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'connect':
        case 'disconnect':
          if (!member.inherited && (service[member.name] = getWsConnection(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'message':
          if (!member.inherited && (service[member.name] = getWsMessage(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
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

    if (!isCompleteWsService(service)) {
      errorList.push(new IncompleteServiceError([...properties], fileName));
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
