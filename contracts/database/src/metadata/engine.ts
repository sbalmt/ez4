import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { DatabaseEngine } from '../types/engine';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  InvalidServicePropertyError,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  getPropertyStringIn,
  getReferenceType
} from '@ez4/common/library';

import { ParametersMode } from '../services/parameters';
import { PaginationMode } from '../services/pagination';
import { TransactionMode } from '../services/transaction';
import { InsensitiveMode } from '../services/insensitive';
import { IncompleteEngineError } from '../errors/engine';
import { OrderMode } from '../services/order';
import { LockMode } from '../services/lock';
import { isDatabaseEngine } from './utils';

export const getDatabaseEngine = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeEngine(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeEngine(declaration, parent, errorList);
  }

  return undefined;
};

const isValidEngine = (type: Incomplete<DatabaseEngine>): type is DatabaseEngine => {
  return (
    !!type.name && !!type.parametersMode && !!type.transactionMode && !!type.insensitiveMode && !!type.paginationMode && !!type.orderMode
  );
};

const getTypeEngine = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isDatabaseEngine(type)) {
    return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  return undefined;
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const engine: Incomplete<DatabaseEngine> = {};

  const properties = new Set(['name', 'parametersMode', 'transactionMode', 'insensitiveMode', 'paginationMode', 'orderMode']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'name':
        if ((engine.name = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;

      case 'parametersMode':
        if ((engine.parametersMode = getPropertyStringIn(member, [ParametersMode.OnlyIndex, ParametersMode.NameAndIndex]))) {
          properties.delete(member.name);
        }
        break;

      case 'transactionMode':
        if ((engine.transactionMode = getPropertyStringIn(member, [TransactionMode.Static, TransactionMode.Interactive]))) {
          properties.delete(member.name);
        }
        break;

      case 'insensitiveMode':
        if ((engine.insensitiveMode = getPropertyStringIn(member, [InsensitiveMode.Unsupported, InsensitiveMode.Enabled]))) {
          properties.delete(member.name);
        }
        break;

      case 'paginationMode':
        if ((engine.paginationMode = getPropertyStringIn(member, [PaginationMode.Cursor, PaginationMode.Offset]))) {
          properties.delete(member.name);
        }
        break;

      case 'orderMode':
        if ((engine.orderMode = getPropertyStringIn(member, [OrderMode.AnyColumns, OrderMode.IndexColumns]))) {
          properties.delete(member.name);
        }
        break;

      case 'lockMode':
        if ((engine.lockMode = getPropertyStringIn(member, [LockMode.Unsupported, LockMode.Supported]))) {
          properties.delete(member.name);
        }
        break;
    }
  }

  if (!isValidEngine(engine)) {
    errorList.push(new IncompleteEngineError([...properties], type.file));
    return undefined;
  }

  return engine;
};
