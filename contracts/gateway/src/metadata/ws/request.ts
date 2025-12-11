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

import { IncorrectRequestTypeError, InvalidRequestTypeError } from '../../errors/web/request';
import { getAuthIdentityMetadata } from '../auth/identity';
import { getWebBodyMetadata } from '../web/body';
import { getFullTypeName } from '../utils/type';
import { WsNamespaceType } from './types';

const FULL_BASE_TYPE = getFullTypeName(WsNamespaceType, 'Request');

export const isWsRequestDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, FULL_BASE_TYPE);
};

export const getWsRequestMetadata = (
  type: AllType,
  parent: TypeModel,
  reflection: SourceMap,
  errorList: Error[]
): WsRequest | undefined => {
  if (isTypeIntersection(type) && type.elements.length > 0) {
    return getWsRequestMetadata(type.elements[0], parent, reflection, errorList);
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
    errorList.push(new InvalidRequestTypeError(FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  if (!isWsRequestDeclaration(type)) {
    errorList.push(new IncorrectRequestTypeError(type.name, FULL_BASE_TYPE, type.file));
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

      case 'identity': {
        request.identity = getAuthIdentityMetadata(member.value, type, reflection, errorList, WsNamespaceType);

        if (request.identity && member.description) {
          request.identity.description = member.description;
        }

        break;
      }

      case 'body': {
        request.body = getWebBodyMetadata(member.value, type, reflection, errorList, WsNamespaceType);

        if (request.body && member.description) {
          request.body.description = member.description;
        }

        break;
      }
    }
  }

  return request;
};
