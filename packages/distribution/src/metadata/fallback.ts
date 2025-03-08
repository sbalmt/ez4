import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnFallback } from '../types/fallback.js';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyString,
  getPropertyTuple,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import { IncompleteFallbackError, IncorrectFallbackTypeError, InvalidFallbackTypeError } from '../errors/fallback.js';
import { isCdnFallback } from './utils.js';

export const getAllFallbacks = (member: ModelProperty, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
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

const getCdnFallback = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeFallback(type, parent, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeFallback(statement, parent, errorList);
  }

  return null;
};

const isValidFallback = (type: Incomplete<CdnFallback>): type is CdnFallback => {
  return !!type.code && !!type.location;
};

const getTypeFallback = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidFallbackTypeError(parent.file));
    return null;
  }

  if (!isCdnFallback(type)) {
    errorList.push(new IncorrectFallbackTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const fallback: Incomplete<CdnFallback> = {};
  const properties = new Set(['code', 'location']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'location':
        if ((fallback.location = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;

      case 'ttl':
      case 'code': {
        const value = getPropertyNumber(member);

        if (isAnyNumber(value)) {
          properties.delete(member.name);
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
