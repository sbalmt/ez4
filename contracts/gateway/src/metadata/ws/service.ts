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

import { IncompleteServiceError } from '../../errors/web/service';
import { getWebBodyMetadata } from '../web/body';
import { getFullTypeName } from '../utils/type';
import { WsNamespaceType, WsServiceType } from './types';
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

    const service: Incomplete<WsService> = { type: WsServiceType, context: {} };
    const properties = new Set(['schema', 'connect', 'disconnect', 'message']);

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

const isCompleteService = (type: Incomplete<WsService>): type is WsService => {
  return isObjectWith(type, ['name', 'schema', 'connect', 'disconnect', 'message', 'context']);
};
