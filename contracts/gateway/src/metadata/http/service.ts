import type { AllType, SourceMap, TypeClass } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { HttpService } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getPropertyString,
  getModelMembers,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteServiceError, ServiceCollisionError } from '../../errors/web/service';
import { getFullTypeName } from '../utils/type';
import { HttpNamespaceType, HttpServiceType } from './types';
import { getHttpDefaultsMetadata } from './defaults';
import { getHttpAccessMetadata } from './access';
import { getHttpCacheMetadata } from './cache';
import { getHttpLocalRoutes } from './routes';
import { getHttpCorsMetadata } from './cors';

export const isHttpServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, getFullTypeName(HttpNamespaceType, 'Service'));
};

export const getHttpServicesMetadata = (reflection: SourceMap) => {
  const allServices: Record<string, HttpService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isHttpServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service: Incomplete<HttpService> = { type: HttpServiceType, context: {} };
    const properties = new Set(['routes']);

    const fileName = declaration.file;

    service.name = declaration.name;

    if (declaration.description) {
      service.description = declaration.description;
    }

    for (const member of getModelMembers(declaration)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        default:
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'routes':
          if ((service.routes = getHttpLocalRoutes(declaration, member, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'name':
          service.displayName = getPropertyString(member);
          break;

        case 'defaults':
          service.defaults = getHttpDefaultsMetadata(member.value, declaration, reflection, errorList);
          break;

        case 'cache':
          service.cache = getHttpCacheMetadata(member.value, declaration, reflection, errorList);
          break;

        case 'access':
          service.access = getHttpAccessMetadata(member.value, declaration, reflection, errorList);
          break;

        case 'cors':
          service.cors = getHttpCorsMetadata(member.value, declaration, reflection, errorList);
          break;

        case 'variables':
          service.variables = getLinkedVariableList(member, errorList);
          break;

        case 'services':
          service.services = getLinkedServiceList(member, reflection, errorList);
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

    assignProviderServices(service, errorList, fileName);

    allServices[declaration.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isCompleteService = (type: Incomplete<HttpService>): type is HttpService => {
  return isObjectWith(type, ['name', 'routes', 'context']);
};

const assignProviderServices = (service: HttpService, errorList: Error[], fileName?: string) => {
  for (const route of service.routes) {
    const provider = route.handler.provider;

    if (!provider?.services) {
      continue;
    }

    if (!service.services) {
      service.services = {};
    }

    for (const serviceName in provider.services) {
      const currentServiceType = service.services[serviceName];
      const handlerServiceType = provider.services[serviceName];

      if (!currentServiceType) {
        service.services[serviceName] = handlerServiceType;
        continue;
      }

      if (currentServiceType !== handlerServiceType) {
        errorList.push(new ServiceCollisionError(serviceName, fileName));
      }
    }
  }
};
