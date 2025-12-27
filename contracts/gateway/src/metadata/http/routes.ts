import type { AllType, EveryType, ModelProperty, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { ObjectSchema } from '@ez4/schema';
import type { Incomplete } from '@ez4/utils';
import type { HttpRoute } from './types';

import { isModelProperty, isTypeObject, isTypeReference, isTypeTuple } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLinkedVariableList,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyString,
  getObjectMembers,
  getModelMembers,
  getServiceListener,
  getServiceArchitecture,
  getServiceRuntime,
  getReferenceType,
  getPropertyTuple,
  hasHeritageType
} from '@ez4/common/library';

import { IncompleteRouteError } from '../../errors/http/route';
import { MismatchParametersTypeError } from '../../errors/parameters';
import { getAuthHandlerMetadata } from '../auth/handler';
import { getFullTypeName } from '../utils/name';
import { isHttpPath } from '../utils/path';
import { getWebPreferencesMetadata } from '../preferences';
import { getHttpHandlerMetadata } from './handler';
import { getHttpErrorsMetadata } from './errors';
import { HttpNamespaceType } from './types';

export const isHttpRouteDeclaration = (type: AllType): type is TypeModel => {
  return isModelDeclaration(type) && hasHeritageType(type, getFullTypeName(HttpNamespaceType, 'Route'));
};

export const getHttpLocalRoutes = (parent: TypeModel, member: ModelProperty, reflection: ReflectionTypes, errorList: Error[]) => {
  return getHttpRoutes(parent, member, reflection, errorList, false);
};

export const getHttpRemoteRoutes = (parent: TypeModel, member: ModelProperty, reflection: ReflectionTypes, errorList: Error[]) => {
  return getHttpRoutes(parent, member, reflection, errorList, true);
};

const getHttpRoutes = (parent: TypeModel, member: ModelProperty, reflection: ReflectionTypes, errorList: Error[], external: boolean) => {
  if (!isTypeReference(member.value)) {
    return getRouteFromTuple(getPropertyTuple(member) ?? [], parent, reflection, errorList, external);
  }

  const declaration = getReferenceType(member.value, reflection);

  if (declaration && isTypeTuple(declaration)) {
    return getRouteFromTuple(declaration.elements, parent, reflection, errorList, external);
  }

  return undefined;
};

const getRouteFromTuple = (
  routeItems: EveryType[],
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[],
  external: boolean
) => {
  const routeList: HttpRoute[] = [];

  for (const route of routeItems) {
    const result = getTypeFromRoute(route, parent, reflection, errorList, external);

    if (Array.isArray(result)) {
      routeList.push(...result);
    } else if (result) {
      routeList.push(result);
    }
  }

  return routeList;
};

const getTypeFromRoute = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[], external: boolean) => {
  if (!isTypeReference(type)) {
    return getRouteType(type, parent, reflection, errorList, external);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getRouteType(declaration, parent, reflection, errorList, external);
  }

  return undefined;
};

const isCompleteRoute = (type: Incomplete<HttpRoute>): type is HttpRoute => {
  return isObjectWith(type, ['path', 'handler']);
};

const getRouteType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[], external: boolean) => {
  if (isHttpRouteDeclaration(type)) {
    return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList, external);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList, external);
  }

  if (isTypeTuple(type) && type.spread) {
    return getRouteFromTuple(type.elements, parent, reflection, errorList, external);
  }

  return undefined;
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[],
  external: boolean
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

      case 'name':
        route.name = getPropertyString(member);
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
        if ((route.handler = getHttpHandlerMetadata(member.value, parent, reflection, errorList, external))) {
          properties.delete(member.name);
        }
        break;

      case 'authorizer':
        route.authorizer = getAuthHandlerMetadata(member.value, parent, reflection, errorList, HttpNamespaceType);
        break;

      case 'preferences':
        route.preferences = getWebPreferencesMetadata(member.value, parent, reflection, errorList, HttpNamespaceType);
        break;

      case 'httpErrors':
        route.httpErrors = getHttpErrorsMetadata(member.value, parent, reflection, errorList);
        break;

      case 'memory':
      case 'logRetention':
      case 'timeout':
        route[member.name] = getPropertyNumber(member);
        break;

      case 'architecture':
        route[member.name] = getServiceArchitecture(member);
        break;

      case 'runtime':
        route[member.name] = getServiceRuntime(member);
        break;

      case 'cors':
      case 'disabled':
        route[member.name] = getPropertyBoolean(member);
        break;

      case 'listener':
        route.listener = getServiceListener(member.value, errorList);
        break;

      case 'variables':
        route.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (!isCompleteRoute(route)) {
    errorList.push(new IncompleteRouteError([...properties], type.file));
    return undefined;
  }

  const mismatchParameters = getMismatchParameters(route.path, route.handler.request?.parameters);

  if (mismatchParameters.length) {
    errorList.push(new MismatchParametersTypeError(mismatchParameters, parent.file));
    return undefined;
  }

  return route;
};

const PARAMETER_NAME_PATTERN = /\{([\w_-]+)\}/g;

const getMismatchParameters = (path: string, parametersSchema: ObjectSchema | undefined) => {
  const allParameters = path.matchAll(PARAMETER_NAME_PATTERN);
  const allMismatches = [];

  for (const pathParameter of allParameters) {
    const [, parameterName] = pathParameter;

    if (!parametersSchema?.properties[parameterName]) {
      allMismatches.push(parameterName);
    }
  }

  return allMismatches;
};
