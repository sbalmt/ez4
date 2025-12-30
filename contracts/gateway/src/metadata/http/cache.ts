import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpCache } from './types';

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

import { IncompleteCacheError, IncorrectCacheTypeError, InvalidCacheTypeError } from '../../errors/http/cache';
import { getFullTypeName } from '../utils/name';
import { HttpNamespaceType } from './types';

const FULL_BASE_TYPE = getFullTypeName(HttpNamespaceType, 'Cache');

export const isHttpCacheDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, FULL_BASE_TYPE);
};

export const getHttpCacheMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getCacheType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getCacheType(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteCache = (type: Incomplete<HttpCache>): type is HttpCache => {
  return isObjectWith(type, ['authorizerTTL']);
};

const getCacheType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCacheTypeError(FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  if (!isHttpCacheDeclaration(type)) {
    errorList.push(new IncorrectCacheTypeError(type.name, FULL_BASE_TYPE, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const cache: Incomplete<HttpCache> = {};
  const properties = new Set(['authorizerTTL']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'authorizerTTL': {
        const value = getPropertyNumber(member);

        if (isAnyNumber(value)) {
          cache[member.name] = value;
          properties.delete(member.name);
        }

        break;
      }
    }
  }

  if (!isCompleteCache(cache)) {
    errorList.push(new IncompleteCacheError([...properties], type.file));
    return undefined;
  }

  return cache;
};
