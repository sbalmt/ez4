import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { DatabaseEngine } from '../types/engine.js';

import { InvalidServicePropertyError, getModelMembers, getObjectMembers, getPropertyString, getReferenceType } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { Engine } from '../services/engine.js';
import { IncompleteTableError } from '../errors/table.js';
import { isDatabaseEngine } from './utils.js';

export const getDatabaseEngine = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeEngine(type, parent, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeEngine(statement, parent, errorList);
  }

  return null;
};

const isValidEngine = (type: Incomplete<DatabaseEngine>): type is DatabaseEngine => {
  return !!type.name && !!type.parametersMode && !!type.transactionMode && !!type.orderMode;
};

const getTypeEngine = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isDatabaseEngine(type)) {
    return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  return null;
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const engine: Incomplete<DatabaseEngine> = {};

  const properties = new Set(['name', 'parameters', 'transaction', 'order']);

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

      case 'parameters':
        if ((engine.parametersMode = getParametersMode(member))) {
          properties.delete(member.name);
        }
        break;

      case 'transaction':
        if ((engine.transactionMode = getTransactionMode(member))) {
          properties.delete(member.name);
        }
        break;

      case 'order':
        if ((engine.orderMode = getOrderMode(member))) {
          properties.delete(member.name);
        }
        break;
    }
  }

  if (!isValidEngine(engine)) {
    errorList.push(new IncompleteTableError([...properties], type.file));
    return null;
  }

  return engine;
};

const getParametersMode = (member: ModelProperty) => {
  const type = getPropertyString(member);

  switch (type) {
    case Engine.ParametersMode.NameAndIndex:
    case Engine.ParametersMode.OnlyIndex:
      return type;
  }

  return null;
};

const getTransactionMode = (member: ModelProperty) => {
  const type = getPropertyString(member);

  switch (type) {
    case Engine.TransactionMode.Interactive:
    case Engine.TransactionMode.Static:
      return type;
  }

  return null;
};

const getOrderMode = (member: ModelProperty) => {
  const type = getPropertyString(member);

  switch (type) {
    case Engine.OrderMode.IndexColumns:
    case Engine.OrderMode.AnyColumns:
      return type;
  }

  return null;
};
