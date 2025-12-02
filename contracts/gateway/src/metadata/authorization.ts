import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpAuthorization } from '../types/common';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getObjectMembers,
  getModelMembers,
  getReferenceType,
  getPropertyStringIn,
  getPropertyString
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyString } from '@ez4/utils';

import { IncompleteAuthorizationError, IncorrectAuthorizationTypeError, InvalidAuthorizationTypeError } from '../errors/authorization';
import { AuthorizationType } from '../services/authorization';
import { isHttpAuthorization } from './utils';

export const getHttpAuthorization = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeAuthorization(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeAuthorization(declaration, parent, errorList);
  }

  return undefined;
};

const isValidAuthorization = (type: Incomplete<HttpAuthorization>): type is HttpAuthorization => {
  return isAnyString(type.value);
};

const getTypeAuthorization = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidAuthorizationTypeError(parent.file));
    return undefined;
  }

  if (!isHttpAuthorization(type)) {
    errorList.push(new IncorrectAuthorizationTypeError(type.name, parent.file));
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

  if (isValidAuthorization(authorization)) {
    return authorization;
  }

  errorList.push(new IncompleteAuthorizationError([...properties], type.file));

  return undefined;
};
