import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CacheEngine } from './types';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { IncompleteEngineError, IncorrectEngineTypeError, InvalidEngineTypeError } from '../errors/engine';

export const isCacheEngineDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Cache.Engine');
};

export const getCacheEngineMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeEngine(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeEngine(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteEngine = (type: Incomplete<CacheEngine>): type is CacheEngine => {
  return isObjectWith(type, ['name']);
};

const getTypeEngine = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidEngineTypeError(parent.file));
    return undefined;
  }

  if (!isCacheEngineDeclaration(type)) {
    errorList.push(new IncorrectEngineTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const engine: Incomplete<CacheEngine> = {};

  const properties = new Set(['name']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'name': {
        if ((engine.name = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;
      }
    }
  }

  if (!isCompleteEngine(engine)) {
    errorList.push(new IncompleteEngineError([...properties], type.file));
    return undefined;
  }

  return engine;
};
