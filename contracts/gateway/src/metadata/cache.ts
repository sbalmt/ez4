import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpCache } from '../types/common.js';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import { IncompleteCacheError, IncorrectCacheTypeError, InvalidCacheTypeError } from '../errors/cache.js';
import { isHttpCache } from './utils.js';

export const getHttpCache = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeCache(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeCache(declaration, parent, errorList);
  }

  return null;
};

const isValidCache = (type: Incomplete<HttpCache>): type is HttpCache => {
  return isAnyNumber(type.authorizerTTL);
};

const getTypeCache = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCacheTypeError(parent.file));
    return null;
  }

  if (!isHttpCache(type)) {
    errorList.push(new IncorrectCacheTypeError(type.name, type.file));
    return null;
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
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

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

  if (isValidCache(cache)) {
    return cache;
  }

  errorList.push(new IncompleteCacheError([...properties], type.file));

  return null;
};
