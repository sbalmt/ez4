import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { HttpRoute } from '../types/route.js';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyBoolean, isAnyNumber } from '@ez4/utils';

import {
  getLinkedVariableList,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyString,
  getObjectMembers,
  getModelMembers
} from '@ez4/common/library';

import { isHttpPath } from '../types/path.js';
import { IncompleteRouteError } from '../errors/route.js';
import { getHttpAuthorizer } from './authorizer.js';
import { getHttpHandler } from './handler.js';
import { isHttpRoute } from './utils.js';

export const getHttpRoute = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeRoute(type, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeRoute(statement, reflection, errorList);
  }

  return null;
};

const isValidRoute = (type: Incomplete<HttpRoute>): type is HttpRoute => {
  return !!type.path && !!type.handler;
};

const getTypeRoute = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (isHttpRoute(type)) {
    return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  return null;
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
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
      case 'path': {
        const path = getPropertyString(member);
        if (path && isHttpPath(path)) {
          properties.delete(member.name);
          route.path = path;
        }
        break;
      }

      case 'timeout':
      case 'memory': {
        const value = getPropertyNumber(member);
        if (isAnyNumber(value)) {
          route[member.name] = value;
        }
        break;
      }

      case 'cors': {
        const value = getPropertyBoolean(member);
        if (isAnyBoolean(value)) {
          route[member.name] = value;
        }
        break;
      }

      case 'handler':
        if ((route.handler = getHttpHandler(member.value, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'authorizer': {
        const value = getHttpAuthorizer(member.value, reflection, errorList);
        if (value) {
          route.authorizer = value;
        }
        break;
      }

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
