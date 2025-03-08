import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { HttpAuthRequest, HttpRequest } from '../types/common.js';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  hasHeritageType,
  getModelMembers,
  getObjectMembers,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectRequestTypeError, InvalidRequestTypeError } from '../errors/request.js';
import { getHttpParameters } from './parameters.js';
import { getHttpIdentity } from './identity.js';
import { getHttpRequestBody } from './body.js';
import { getHttpHeaders } from './headers.js';
import { getHttpQuery } from './query.js';

export const getHttpAuthRequest = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  return getHttpRequest(type, parent, reflection, errorList, 'Http.AuthRequest');
};

export const getHttpHandlerRequest = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  return getHttpRequest(type, parent, reflection, errorList, 'Http.Request');
};

const getHttpRequest = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[], baseType: string) => {
  if (!isTypeReference(type)) {
    return getTypeRequest(type, parent, reflection, errorList, baseType);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeRequest(statement, parent, reflection, errorList, baseType);
  }

  return null;
};

const getTypeRequest = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[], baseType: string) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRequestTypeError(baseType, parent.file));
    return null;
  }

  if (!hasHeritageType(type, baseType)) {
    errorList.push(new IncorrectRequestTypeError(type.name, baseType, type.file));
    return null;
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
  const request: HttpAuthRequest & HttpRequest = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

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
        request.body = getHttpRequestBody(member.value, type, reflection, errorList);

        if (request.body && member.description) {
          request.body.description = member.description;
        }

        break;
      }
    }
  }

  return request;
};
