import type { AllType, ModelProperty, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnFallback } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyString,
  getPropertyTuple,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber, isObjectWith } from '@ez4/utils';

import { IncompleteFallbackError, IncorrectFallbackTypeError, InvalidFallbackTypeError } from '../errors/fallback';

export const isCdnFallbackMetadata = (type: AllType) => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Cdn.Fallback');
};

export const getCndFallbacksMetadata = (member: ModelProperty, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
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

const getCdnFallback = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getFallbackType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getFallbackType(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteFallback = (type: Incomplete<CdnFallback>): type is CdnFallback => {
  return isObjectWith(type, ['code', 'location']);
};

const getFallbackType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidFallbackTypeError(parent.file));
    return undefined;
  }

  if (!isCdnFallbackMetadata(type)) {
    errorList.push(new IncorrectFallbackTypeError(type.name, type.file));
    return undefined;
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
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'location': {
        if ((fallback.location = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;
      }

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

  if (!isCompleteFallback(fallback)) {
    errorList.push(new IncompleteFallbackError([...properties], type.file));
    return undefined;
  }

  return fallback;
};
