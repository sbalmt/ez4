import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpAuthorization } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getObjectMembers,
  getModelMembers,
  getReferenceType,
  getPropertyStringIn,
  getPropertyString,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyString, isObjectWith } from '@ez4/utils';

import {
  IncompleteAuthorizationError,
  IncorrectAuthorizationTypeError,
  InvalidAuthorizationTypeError
} from '../../errors/http/authorization';

import { AuthorizationType } from '../../services/http/authorization';
import { getFullTypeName } from '../utils/name';
import { HttpNamespaceType } from './types';

const FULL_BASE_TYPE = getFullTypeName(HttpNamespaceType, 'Authorization');

export const isHttpAuthorizationDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, FULL_BASE_TYPE);
};

export const getHttpAuthorizationMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeAuthorization(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeAuthorization(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteAuthorization = (type: Incomplete<HttpAuthorization>): type is HttpAuthorization => {
  return isObjectWith(type, ['value']);
};

const getTypeAuthorization = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidAuthorizationTypeError(FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  if (!isHttpAuthorizationDeclaration(type)) {
    errorList.push(new IncorrectAuthorizationTypeError(type.name, FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const properties = new Set(['value']);

  const authorization: Incomplete<HttpAuthorization> = {
    type: AuthorizationType.Bearer,
    header: 'authorization'
  };

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, parent.file));
        break;

      case 'type':
        authorization.type = getPropertyStringIn(member, [AuthorizationType.Bearer]);
        break;

      case 'value':
      case 'header': {
        const value = getPropertyString(member);

        if (isAnyString(value)) {
          authorization[member.name] = value;
          properties.delete(member.name);
        }

        break;
      }
    }
  }

  if (isCompleteAuthorization(authorization)) {
    return authorization;
  }

  errorList.push(new IncompleteAuthorizationError([...properties], type.file));

  return undefined;
};
