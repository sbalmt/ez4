import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpCors } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyBoolean,
  getPropertyStringList,
  getPropertyNumber,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteCorsError, IncorrectCorsTypeError, InvalidCorsTypeError } from '../../errors/http/cors';
import { getFullTypeName } from '../utils/name';
import { HttpNamespaceType } from './types';

const FULL_BASE_TYPE = getFullTypeName(HttpNamespaceType, 'Cors');

export const isHttpCorsDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, FULL_BASE_TYPE);
};

export const getHttpCorsMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getCorsType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getCorsType(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteCors = (type: Incomplete<HttpCors>): type is HttpCors => {
  return isObjectWith(type, ['allowOrigins']) && !!type.allowOrigins.length;
};

const getCorsType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCorsTypeError(FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  if (!isHttpCorsDeclaration(type)) {
    errorList.push(new IncorrectCorsTypeError(type.name, FULL_BASE_TYPE, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const cors: Incomplete<HttpCors> = {};
  const properties = new Set(['allowOrigins']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'allowOrigins':
      case 'allowMethods':
      case 'allowHeaders':
      case 'exposeHeaders': {
        cors[member.name] = getPropertyStringList(member);
        break;
      }

      case 'allowCredentials': {
        cors.allowCredentials = getPropertyBoolean(member);
        break;
      }

      case 'maxAge': {
        cors.maxAge = getPropertyNumber(member);
        break;
      }
    }
  }

  if (!isCompleteCors(cors)) {
    errorList.push(new IncompleteCorsError([...properties], type.file));
    return undefined;
  }

  return cors;
};
