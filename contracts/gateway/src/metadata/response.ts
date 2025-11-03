import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpAuthResponse, HttpResponse } from '../types/common';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  hasHeritageType,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyNumberList,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import { IncorrectResponseTypeError, InvalidResponseTypeError } from '../errors/response';
import { getHttpIdentity } from './identity';
import { getHttpHeaders } from './headers';
import { getHttpBody } from './body';

export const getHttpAuthResponse = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  const response = getHttpResponse(type, parent, reflection, errorList, 'Http.AuthResponse');

  if (response && isValidAuthResponse(response)) {
    return response;
  }

  return undefined;
};

export const getHttpHandlerResponse = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  const response = getHttpResponse(type, parent, reflection, errorList, 'Http.Response');

  if (response && isValidHandlerResponse(response)) {
    return response;
  }

  return undefined;
};

const getHttpResponse = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[], baseType: string) => {
  if (!isTypeReference(type)) {
    return getTypeResponse(type, parent, reflection, errorList, baseType);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeResponse(declaration, parent, reflection, errorList, baseType);
  }

  return undefined;
};

const isValidAuthResponse = (type: Incomplete<HttpAuthResponse>): type is HttpAuthResponse => {
  return !!type.identity;
};

const isValidHandlerResponse = (type: Incomplete<HttpResponse>): type is HttpResponse => {
  return isAnyNumber(type.status) || Array.isArray(type.status);
};

const getTypeResponse = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[], baseType: string) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidResponseTypeError(baseType, parent.file));
    return undefined;
  }

  if (!hasHeritageType(type, baseType)) {
    errorList.push(new IncorrectResponseTypeError(type.name, baseType, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
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
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'status':
        response.status = getPropertyNumber(member) ?? getPropertyNumberList(member);
        break;

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
        response.body = getHttpBody(member.value, type, reflection, errorList);

        if (response.body && member.description) {
          response.body.description = member.description;
        }

        break;
      }
    }
  }

  return response;
};
