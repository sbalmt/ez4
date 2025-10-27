import type { SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { HttpService } from '../types/service';

import {
  DuplicateServiceError,
  isExternalDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString,
  InvalidServicePropertyError
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ServiceType } from '../types/service';
import { IncompleteServiceError, ServiceCollisionError } from '../errors/service';
import { getHttpDefaults } from './defaults';
import { getHttpRoutes } from './route';
import { getHttpCache } from './cache';
import { getHttpAccess } from './access';
import { getHttpCors } from './cors';
import { isHttpService } from './utils';

export const getHttpServices = (reflection: SourceMap) => {
  const allServices: Record<string, HttpService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isHttpService(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service: Incomplete<HttpService> = { type: ServiceType, extras: {} };
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
          if ((service.routes = getHttpRoutes(declaration, member, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'name':
          service.displayName = getPropertyString(member);
          break;

        case 'defaults':
          service.defaults = getHttpDefaults(member.value, declaration, reflection, errorList);
          break;

        case 'cache':
          service.cache = getHttpCache(member.value, declaration, reflection, errorList);
          break;

        case 'access':
          service.access = getHttpAccess(member.value, declaration, reflection, errorList);
          break;

        case 'cors':
          service.cors = getHttpCors(member.value, declaration, reflection, errorList);
          break;

        case 'variables':
          service.variables = getLinkedVariableList(member, errorList);
          break;

        case 'services':
          service.services = getLinkedServiceList(member, reflection, errorList);
          break;
      }
    }

    if (!isValidService(service)) {
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

const isValidService = (type: Incomplete<HttpService>): type is HttpService => {
  return !!type.name && !!type.routes && !!type.extras;
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
