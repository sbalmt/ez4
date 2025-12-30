import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpResponse } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyNumberList,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber, isObjectWith } from '@ez4/utils';

import { IncorrectResponseTypeError, InvalidResponseTypeError } from '../../errors/response';
import { getFullTypeName } from '../utils/name';
import { getWebHeadersMetadata } from '../headers';
import { getWebBodyMetadata } from '../body';
import { HttpNamespaceType } from './types';

const FULL_BASE_TYPE = getFullTypeName(HttpNamespaceType, 'Response');

export const isHttpResponseDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, FULL_BASE_TYPE);
};

export const getHttpResponseMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getResponseType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getResponseType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isCompleteResponse = (type: Incomplete<HttpResponse>): type is HttpResponse => {
  return isObjectWith(type, ['status']) && (isAnyNumber(type.status) || !!type.status.length);
};

const getResponseType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidResponseTypeError(FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  if (!isHttpResponseDeclaration(type)) {
    errorList.push(new IncorrectResponseTypeError(type.name, FULL_BASE_TYPE, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const response: Incomplete<HttpResponse> = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'status': {
        response.status = getPropertyNumber(member) ?? getPropertyNumberList(member);
        break;
      }

      case 'headers': {
        response.headers = getWebHeadersMetadata(member.value, type, reflection, errorList, HttpNamespaceType);

        if (response.headers && member.description) {
          response.headers.description = member.description;
        }

        break;
      }

      case 'body': {
        response.body = getWebBodyMetadata(member.value, type, reflection, errorList, HttpNamespaceType);

        if (response.body && member.description) {
          response.body.description = member.description;
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
