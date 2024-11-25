import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnCache } from '../types/cache.js';

import {
  getModelMembers,
  getObjectMembers,
  getPropertyBoolean,
  getPropertyNumber,
  isModelDeclaration
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyBoolean, isAnyNumber } from '@ez4/utils';

import {
  IncompleteCacheError,
  IncorrectCacheTypeError,
  InvalidCacheTypeError
} from '../errors/cache.js';

import { isCdnCache } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getCdnCache = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeCache(type, parent, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeCache(statement, parent, errorList);
  }

  return null;
};

const isValidCache = (type: Incomplete<CdnCache>): type is CdnCache => {
  return isAnyNumber(type.ttl);
};

const getTypeCache = (type: AllType, parent: TypeParent, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCacheTypeError(parent.file));
    return null;
  }

  if (!isCdnCache(type)) {
    errorList.push(new IncorrectCacheTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  errorList: Error[]
) => {
  const cache: Incomplete<CdnCache> = {};
  const properties = new Set(['ttl']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'ttl':
      case 'minTTL':
      case 'maxTTL': {
        const value = getPropertyNumber(member);
        if (isAnyNumber(value)) {
          cache[member.name] = value;
          properties.delete(member.name);
        }
        break;
      }

      case 'compress': {
        const value = getPropertyBoolean(member);
        if (isAnyBoolean(value)) {
          cache[member.name] = value;
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
