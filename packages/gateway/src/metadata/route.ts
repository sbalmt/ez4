import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpRoute } from '../types/common.js';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  InvalidServicePropertyError,
  getLinkedVariableList,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyString,
  getObjectMembers,
  getModelMembers,
  getServiceListener,
  getReferenceType
} from '@ez4/common/library';

import { IncompleteRouteError } from '../errors/route.js';
import { isHttpPath, isHttpRoute } from './utils.js';
import { getHttpAuthorizer } from './authorizer.js';
import { getHttpHandler } from './handler.js';

export const getHttpRoute = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeRoute(type, parent, reflection, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeRoute(statement, parent, reflection, errorList);
  }

  return null;
};

const isValidRoute = (type: Incomplete<HttpRoute>): type is HttpRoute => {
  return !!type.path && !!type.handler;
};

const getTypeRoute = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isHttpRoute(type)) {
    return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
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

      case 'timeout':
      case 'memory':
        route[member.name] = getPropertyNumber(member);
        break;

      case 'cors':
        route.cors = getPropertyBoolean(member);
        break;

      case 'authorizer':
        route.authorizer = getHttpAuthorizer(member.value, parent, reflection, errorList);
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
