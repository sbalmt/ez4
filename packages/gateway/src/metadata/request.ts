import type { HttpAuthRequest, HttpRequest } from '../types/request.js';

import type {
  AllType,
  EveryMemberType,
  SourceMap,
  TypeCallback,
  TypeFunction,
  TypeModel,
  TypeObject
} from '@ez4/reflection';

import {
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectRequestTypeError, InvalidRequestTypeError } from '../errors/request.js';
import { getHttpHeaders } from './headers.js';
import { getHttpIdentity } from './identity.js';
import { getHttpParameters } from './parameters.js';
import { getHttpQuery } from './query.js';
import { getHttpBody } from './body.js';

type TypeParent = TypeModel | TypeCallback | TypeFunction;

export const getHttpAuthorizerRequest = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  return getHttpRequest(type, parent, reflection, errorList, 'Http.AuthRequest');
};

export const getHttpHandlerRequest = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  return getHttpRequest(type, parent, reflection, errorList, 'Http.Request');
};

const getHttpRequest = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[],
  baseType: string
) => {
  if (!isTypeReference(type)) {
    return getTypeRequest(type, parent, reflection, errorList, baseType);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeRequest(statement, parent, reflection, errorList, baseType);
  }

  return null;
};

const getTypeRequest = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[],
  baseType: string
) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRequestTypeError(baseType, parent.file));
    return null;
  }

  if (!hasHeritageType(type, baseType)) {
    errorList.push(new IncorrectRequestTypeError(type.name, baseType, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: EveryMemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const request: HttpAuthRequest & HttpRequest = {};

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    switch (member.name) {
      case 'headers': {
        request.headers = getHttpHeaders(member.value, type, reflection, errorList);

        if (request.headers && member.description) {
          request.headers.description = member.description;
        }

        break;
      }

      case 'identity': {
        request.identity = getHttpIdentity(member.value, type, reflection, errorList);

        if (request.identity && member.description) {
          request.identity.description = member.description;
        }

        break;
      }

      case 'query': {
        request.query = getHttpQuery(member.value, type, reflection, errorList);

        if (request.query && member.description) {
          request.query.description = member.description;
        }

        break;
      }

      case 'parameters': {
        request.parameters = getHttpParameters(member.value, type, reflection, errorList);

        if (request.parameters && member.description) {
          request.parameters.description = member.description;
        }

        break;
      }

      case 'body': {
        request.body = getHttpBody(member.value, type, reflection, errorList);

        if (request.body && member.description) {
          request.body.description = member.description;
        }

        break;
      }
    }
  }

  return request;
};
