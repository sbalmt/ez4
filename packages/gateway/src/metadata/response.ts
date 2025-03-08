import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { HttpAuthResponse, HttpResponse } from '../types/common.js';

import type {
  AllType,
  SourceMap,
  TypeCallback,
  TypeFunction,
  TypeModel,
  TypeObject
} from '@ez4/reflection';

import {
  isModelDeclaration,
  hasHeritageType,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import { IncorrectResponseTypeError, InvalidResponseTypeError } from '../errors/response.js';
import { getHttpHeaders } from './headers.js';
import { getHttpResponseBody } from './body.js';
import { getHttpIdentity } from './identity.js';

type TypeParent = TypeModel | TypeCallback | TypeFunction;

export const getHttpAuthResponse = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  const response = getHttpResponse(type, parent, reflection, errorList, 'Http.AuthResponse');

  if (response && isValidAuthResponse(response)) {
    return response;
  }

  return null;
};

export const getHttpHandlerResponse = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  const response = getHttpResponse(type, parent, reflection, errorList, 'Http.Response');

  if (response && isValidHandlerResponse(response)) {
    return response;
  }

  return null;
};

const getHttpResponse = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[],
  baseType: string
) => {
  if (!isTypeReference(type)) {
    return getTypeResponse(type, parent, reflection, errorList, baseType);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeResponse(statement, parent, reflection, errorList, baseType);
  }

  return null;
};

const isValidAuthResponse = (type: Incomplete<HttpAuthResponse>): type is HttpAuthResponse => {
  return !!type.identity;
};

const isValidHandlerResponse = (type: Incomplete<HttpResponse>): type is HttpResponse => {
  return isAnyNumber(type.status);
};

const getTypeResponse = (
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
    errorList.push(new InvalidResponseTypeError(baseType, parent.file));
    return null;
  }

  if (!hasHeritageType(type, baseType)) {
    errorList.push(new IncorrectResponseTypeError(type.name, baseType, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const response: Incomplete<HttpAuthResponse & HttpResponse> = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'status': {
        const value = getPropertyNumber(member);

        if (isAnyNumber(value)) {
          response[member.name] = value;
        }

        break;
      }

      case 'headers': {
        response.headers = getHttpHeaders(member.value, type, reflection, errorList);

        if (response.headers && member.description) {
          response.headers.description = member.description;
        }

        break;
      }

      case 'identity': {
        response.identity = getHttpIdentity(member.value, type, reflection, errorList);

        if (response.identity && member.description) {
          response.identity.description = member.description;
        }

        break;
      }

      case 'body': {
        response.body = getHttpResponseBody(member.value, type, reflection, errorList);

        if (response.body && member.description) {
          response.body.description = member.description;
        }

        break;
      }
    }
  }

  return response;
};
