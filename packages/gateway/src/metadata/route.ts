import type { AllType, EveryType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpRoute } from '../types/common.js';

import { isModelProperty, isTypeObject, isTypeReference, isTypeTuple } from '@ez4/reflection';

import {
  InvalidServicePropertyError,
  getLinkedVariableList,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyString,
  getObjectMembers,
  getModelMembers,
  getServiceListener,
  getReferenceType,
  getPropertyTuple
} from '@ez4/common/library';

import { IncompleteRouteError } from '../errors/route.js';
import { isHttpPath, isHttpRoute } from './utils.js';
import { getHttpAuthorizer } from './authorizer.js';
import { getHttpHandler } from './handler.js';
import { getHttpErrors } from './errors.js';

export const getHttpRoutes = (parent: TypeModel, member: ModelProperty, reflection: SourceMap, errorList: Error[]) => {
  const routeItems = getPropertyTuple(member) ?? [];

  return getRouteFromTuple(routeItems, parent, reflection, errorList);
};

const getRouteFromTuple = (routeItems: EveryType[], parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  const routeList: HttpRoute[] = [];

  for (const route of routeItems) {
    const result = getTypeFromRoute(route, parent, reflection, errorList);

    if (Array.isArray(result)) {
      routeList.push(...result);
    } else if (result) {
      routeList.push(result);
    }
  }

  return routeList;
};

const getTypeFromRoute = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getRouteType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getRouteType(declaration, parent, reflection, errorList);
  }

  return null;
};

const isValidRoute = (type: Incomplete<HttpRoute>): type is HttpRoute => {
  return !!type.path && !!type.handler;
};

const getRouteType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isHttpRoute(type)) {
    return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (isTypeTuple(type) && type.spread) {
    return getRouteFromTuple(type.elements, parent, reflection, errorList);
  }

  return null;
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const route: Incomplete<HttpRoute> = {};
  const properties = new Set(['path', 'handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'path': {
        const path = getPropertyString(member);

        if (path && isHttpPath(path)) {
          properties.delete(member.name);
          route.path = path;
        }

        break;
      }

      case 'handler':
        if ((route.handler = getHttpHandler(member.value, parent, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'authorizer':
        route.authorizer = getHttpAuthorizer(member.value, parent, reflection, errorList);
        break;

      case 'httpErrors':
        route.httpErrors = getHttpErrors(member.value, parent, reflection, errorList);
        break;

      case 'memory':
      case 'logRetention':
      case 'timeout':
        route[member.name] = getPropertyNumber(member);
        break;

      case 'cors':
        route.cors = getPropertyBoolean(member);
        break;

      case 'listener':
        route.listener = getServiceListener(member.value, errorList);
        break;

      case 'variables':
        route.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (isValidRoute(route)) {
    return route;
  }

  errorList.push(new IncompleteRouteError([...properties], type.file));

  return null;
};
