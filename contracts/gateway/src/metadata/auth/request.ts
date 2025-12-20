import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { AuthRequest } from '../auth/types';

import { isModelProperty, isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  hasHeritageType,
  getObjectMembers,
  getModelMembers,
  getReferenceType
} from '@ez4/common/library';

import { IncorrectRequestTypeError, InvalidRequestTypeError } from '../../errors/request';
import { getFullTypeName } from '../utils/type';
import { getWebParametersMetadata } from '../parameters';
import { getWebHeadersMetadata } from '../headers';
import { getWebQueryMetadata } from '../query';

const BASE_TYPE = 'AuthRequest';

export const isAuthRequestDeclaration = (type: TypeModel, namespace: string) => {
  return hasHeritageType(type, getFullTypeName(namespace, BASE_TYPE));
};

export const getAuthRequestMetadata = (
  type: AllType,
  parent: TypeModel,
  reflection: SourceMap,
  errorList: Error[],
  namespace: string
): AuthRequest | undefined => {
  if (isTypeIntersection(type) && type.elements.length > 0) {
    return getAuthRequestMetadata(type.elements[0], parent, reflection, errorList, namespace);
  }

  if (!isTypeReference(type)) {
    return getRequestType(type, parent, reflection, errorList, namespace);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getRequestType(declaration, parent, reflection, errorList, namespace);
  }

  return undefined;
};

const getRequestType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[], namespace: string) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList, namespace);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRequestTypeError(getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  if (!isAuthRequestDeclaration(type, namespace)) {
    errorList.push(new IncorrectRequestTypeError(type.name, getFullTypeName(namespace, BASE_TYPE), type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList, namespace);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel | TypeIntersection,
  parent: TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[],
  namespace: string
) => {
  const request: AuthRequest = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'headers': {
        request.headers = getWebHeadersMetadata(member.value, type, reflection, errorList, namespace);

        if (request.headers && member.description) {
          request.headers.description = member.description;
        }

        break;
      }

      case 'parameters': {
        request.parameters = getWebParametersMetadata(member.value, type, reflection, errorList, namespace);

        if (request.parameters && member.description) {
          request.parameters.description = member.description;
        }

        break;
      }

      case 'query': {
        request.query = getWebQueryMetadata(member.value, type, reflection, errorList, namespace);

        if (request.query && member.description) {
          request.query.description = member.description;
        }

        break;
      }
    }
  }

  return request;
};
