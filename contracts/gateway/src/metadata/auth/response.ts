import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { AuthResponse } from '../auth/types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  hasHeritageType,
  getModelMembers,
  getObjectMembers,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncorrectResponseTypeError, InvalidResponseTypeError } from '../../errors/response';
import { getFullTypeName } from '../utils/name';
import { getAuthIdentityMetadata } from './identity';

const BASE_TYPE = 'AuthResponse';

export const isAuthResponseDeclaration = (type: TypeModel, namespace: string) => {
  return hasHeritageType(type, getFullTypeName(namespace, BASE_TYPE));
};

export const getAuthResponseMetadata = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[],
  namespace: string
) => {
  if (!isTypeReference(type)) {
    return getResponseType(type, parent, reflection, errorList, namespace);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getResponseType(declaration, parent, reflection, errorList, namespace);
  }

  return undefined;
};

const isCompleteResponse = (type: Incomplete<AuthResponse>): type is AuthResponse => {
  return isObjectWith(type, ['identity']);
};

const getResponseType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[], namespace: string) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList, namespace);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidResponseTypeError(getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  if (!isAuthResponseDeclaration(type, namespace)) {
    errorList.push(new IncorrectResponseTypeError(type.name, getFullTypeName(namespace, BASE_TYPE), type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList, namespace);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[],
  namespace: string
) => {
  const response: Incomplete<AuthResponse> = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'identity': {
        response.identity = getAuthIdentityMetadata(member.value, type, reflection, errorList, namespace);

        if (response.identity && member.description) {
          response.identity.description = member.description;
        }

        break;
      }
    }
  }

  if (isCompleteResponse(response)) {
    return response;
  }

  return undefined;
};
