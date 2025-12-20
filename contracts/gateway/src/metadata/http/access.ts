import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpAccess } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber, isObjectWith } from '@ez4/utils';

import { IncompleteAccessError, IncorrectAccessTypeError, InvalidAccessTypeError } from '../../errors/http/access';
import { getFullTypeName } from '../utils/name';
import { HttpNamespaceType } from './types';

export const isHttpAccessDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, getFullTypeName(HttpNamespaceType, 'Access'));
};

export const getHttpAccessMetadata = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getAccessType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getAccessType(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteAccess = (type: Incomplete<HttpAccess>): type is HttpAccess => {
  return isObjectWith(type, ['logRetention']);
};

const getAccessType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidAccessTypeError(parent.file));
    return undefined;
  }

  if (!isHttpAccessDeclaration(type)) {
    errorList.push(new IncorrectAccessTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const access: Incomplete<HttpAccess> = {};
  const properties = new Set(['logRetention']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'logRetention': {
        const value = getPropertyNumber(member);

        if (isAnyNumber(value)) {
          access[member.name] = value;
          properties.delete(member.name);
        }

        break;
      }
    }
  }

  if (isCompleteAccess(access)) {
    return access;
  }

  errorList.push(new IncompleteAccessError([...properties], type.file));

  return undefined;
};
