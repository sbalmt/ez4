import type { Incomplete } from '@ez4/utils';
import type { ModelProperty, SourceMap } from '@ez4/reflection';
import type { HttpService } from '../types/service.js';
import type { HttpRoute } from '../types/common.js';

import {
  DuplicateServiceError,
  isExternalStatement,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString,
  getPropertyTuple
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getHttpDefaults } from './defaults.js';
import { isHttpService } from './utils.js';
import { getHttpRoute } from './route.js';
import { getHttpCors } from './cors.js';

export const getHttpServices = (reflection: SourceMap) => {
  const httpServices: Record<string, HttpService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isHttpService(statement) || isExternalStatement(statement)) {
      continue;
    }

    const service: Incomplete<HttpService> = { type: ServiceType };
    const properties = new Set(['routes']);

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        case 'name': {
          const value = getPropertyString(member);

          if (value) {
            service.displayName = value;
            break;
          }
        }

        case 'defaults':
          service.defaults = getHttpDefaults(member.value, statement, reflection, errorList);
          break;

        case 'routes':
          if ((service.routes = getAllRoutes(member, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'cors':
          service.cors = getHttpCors(member.value, statement, reflection, errorList);
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
      errorList.push(new IncompleteServiceError([...properties], statement.file));
      continue;
    }

    if (httpServices[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, statement.file));
      continue;
    }

    httpServices[statement.name] = service;
  }

  return {
    services: httpServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<HttpService>): type is HttpService => {
  return !!type.name && !!type.routes;
};

const getAllRoutes = (member: ModelProperty, reflection: SourceMap, errorList: Error[]) => {
  const routeItems = getPropertyTuple(member) ?? [];
  const routeList: HttpRoute[] = [];

  for (const route of routeItems) {
    const result = getHttpRoute(route, reflection, errorList);

    if (result) {
      routeList.push(result);
    }
  }

  return routeList;
};
