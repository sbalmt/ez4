import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnCache } from '../types/cache';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyBoolean,
  getPropertyNumber,
  getReferenceType,
  getArrayStrings
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import { IncompleteCacheError, IncorrectCacheTypeError, InvalidCacheTypeError } from '../errors/cache';
import { isCdnCache } from './utils';

export const getCdnCache = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeCache(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeCache(declaration, parent, errorList);
  }

  return null;
};

const isValidCache = (type: Incomplete<CdnCache>): type is CdnCache => {
  return isAnyNumber(type.ttl);
};

const getTypeCache = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCacheTypeError(parent.file));
    return null;
  }

  if (!isCdnCache(type)) {
    errorList.push(new IncorrectCacheTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const cache: Incomplete<CdnCache> = {};
  const properties = new Set(['ttl']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

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

      case 'compress':
        cache.compress = getPropertyBoolean(member);
        break;

      case 'headers':
      case 'cookies':
      case 'queries':
        cache[member.name] = getArrayStrings(member);
        break;
    }
  }

  if (isValidCache(cache)) {
    return cache;
  }

  errorList.push(new IncompleteCacheError([...properties], type.file));

  return null;
};
