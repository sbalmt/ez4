import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { DatabaseEngine } from './types';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  getPropertyStringIn,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { ParametersMode, TransactionMode, InsensitiveMode, PaginationMode, OrderMode, LockMode } from '../types/mode';
import { IncompleteEngineError, IncorrectEngineTypeError, InvalidEngineTypeError } from '../errors/engine';

export const isDatabaseEngineDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Database.Engine');
};

export const getDatabaseEngineMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeEngine(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeEngine(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteEngine = (type: Incomplete<DatabaseEngine>): type is DatabaseEngine => {
  return isObjectWith(type, ['name', 'parametersMode', 'transactionMode', 'insensitiveMode', 'paginationMode', 'orderMode']);
};

const getTypeEngine = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidEngineTypeError(parent.file));
    return undefined;
  }

  if (!isDatabaseEngineDeclaration(type)) {
    errorList.push(new IncorrectEngineTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const engine: Incomplete<DatabaseEngine> = {};

  const properties = new Set(['name', 'parametersMode', 'transactionMode', 'insensitiveMode', 'paginationMode', 'orderMode']);

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

      case 'parametersMode': {
        if ((engine.parametersMode = getPropertyStringIn(member, [ParametersMode.OnlyIndex, ParametersMode.NameAndIndex]))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'transactionMode': {
        if ((engine.transactionMode = getPropertyStringIn(member, [TransactionMode.Static, TransactionMode.Interactive]))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'insensitiveMode': {
        if ((engine.insensitiveMode = getPropertyStringIn(member, [InsensitiveMode.Unsupported, InsensitiveMode.Enabled]))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'paginationMode': {
        if ((engine.paginationMode = getPropertyStringIn(member, [PaginationMode.Cursor, PaginationMode.Offset]))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'orderMode': {
        if ((engine.orderMode = getPropertyStringIn(member, [OrderMode.AnyColumns, OrderMode.IndexColumns]))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'lockMode': {
        if ((engine.lockMode = getPropertyStringIn(member, [LockMode.Unsupported, LockMode.Supported]))) {
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
