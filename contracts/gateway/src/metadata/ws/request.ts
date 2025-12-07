import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { WsRequest } from './types';

import { isModelProperty, isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  hasHeritageType,
  getObjectMembers,
  getModelMembers,
  getReferenceType
} from '@ez4/common/library';

import { IncorrectRequestTypeError, InvalidRequestTypeError } from '../../errors/http/request';
import { getHttpIdentity } from '../identity';
import { getHttpHeaders } from '../headers';
import { getHttpQuery } from '../query';

export const getWsRequest = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]): WsRequest | undefined => {
  if (isTypeIntersection(type) && type.elements.length > 0) {
    return getWsRequest(type.elements[0], parent, reflection, errorList);
  }

  if (!isTypeReference(type)) {
    return getRequestType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getRequestType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getRequestType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRequestTypeError('Ws.Request', parent.file));
    return undefined;
  }

  if (!hasHeritageType(type, 'Ws.Request')) {
    errorList.push(new IncorrectRequestTypeError(type.name, 'Ws.Request', type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel | TypeIntersection,
  parent: TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const request: WsRequest = {};

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
    }
  }

  return request;
};
