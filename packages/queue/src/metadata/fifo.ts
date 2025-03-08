import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { QueueFifoMode } from '../types/common.js';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  IncompleteFifoModeError,
  IncorrectFifoModeTypeError,
  InvalidFifoModeTypeError
} from '../errors/fifo.js';

import { isQueueFifoMode } from './utils.js';

export const getQueueFifoMode = (
  type: AllType,
  parent: TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeFifoMode(type, parent, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeFifoMode(statement, parent, errorList);
  }

  return null;
};

const isValidFifoMode = (type: Incomplete<QueueFifoMode>): type is QueueFifoMode => {
  return !!type.groupId;
};

const getTypeFifoMode = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidFifoModeTypeError(parent.file));
    return null;
  }

  if (!isQueueFifoMode(type)) {
    errorList.push(new IncorrectFifoModeTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  errorList: Error[]
) => {
  const fifoOptions: Incomplete<QueueFifoMode> = {};
  const properties = new Set(['groupId']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'uniqueId':
      case 'groupId': {
        const value = getPropertyString(member);

        if (value) {
          fifoOptions[member.name] = value;
          properties.delete(member.name);
        }

        break;
      }
    }
  }

  if (isValidFifoMode(fifoOptions)) {
    return fifoOptions;
  }

  errorList.push(new IncompleteFifoModeError([...properties], type.file));

  return null;
};
