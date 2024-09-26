import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnFallback } from '../types/fallback.js';

import {
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyString,
  getPropertyTuple,
  isModelDeclaration
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  IncompleteFallbackError,
  IncorrectFallbackTypeError,
  InvalidFallbackTypeError
} from '../errors/fallback.js';

import { isCdnFallback } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getAllFallbacks = (
  member: ModelProperty,
  parent: TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  const fallbackItems = getPropertyTuple(member) ?? [];
  const resultList: CdnFallback[] = [];

  for (const fallback of fallbackItems) {
    const result = getCdnFallback(fallback, parent, reflection, errorList);

    if (result) {
      resultList.push(result);
    }
  }

  return resultList;
};

const getCdnFallback = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeFallback(type, parent, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeFallback(statement, parent, errorList);
  }

  return null;
};

const isValidFallback = (type: Incomplete<CdnFallback>): type is CdnFallback => {
  return !!type.code && !!type.path;
};

const getTypeFallback = (type: AllType, parent: TypeParent, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidFallbackTypeError(parent.file));
    return null;
  }

  if (!isCdnFallback(type)) {
    errorList.push(new IncorrectFallbackTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  errorList: Error[]
) => {
  const fallback: Incomplete<CdnFallback> = {};
  const properties = new Set(['code', 'path']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'ttl':
      case 'code': {
        const value = getPropertyNumber(member);
        if (value !== undefined && value !== null) {
          fallback[member.name] = value;
        }
        break;
      }

      case 'path': {
        const value = getPropertyString(member);
        if (value !== undefined && value !== null) {
          fallback[member.name] = value;
        }
        break;
      }
    }
  }

  if (isValidFallback(fallback)) {
    return fallback;
  }

  errorList.push(new IncompleteFallbackError([...properties], type.file));

  return null;
};
