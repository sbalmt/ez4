import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { CronTarget } from '../types/common.js';

import {
  isModelDeclaration,
  getLinkedVariableList,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getServiceListener
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import {
  IncompleteTargetError,
  IncorrectTargetTypeError,
  InvalidTargetTypeError
} from '../errors/target.js';

import { getTargetHandler } from './handler.js';
import { isCronTarget } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getCronTarget = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeTarget(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeTarget(statement, parent, reflection, errorList);
  }

  return null;
};

const isValidTarget = (type: Incomplete<CronTarget>): type is CronTarget => {
  return !!type.handler;
};

const getTypeTarget = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidTargetTypeError(parent.file));
    return null;
  }

  if (!isCronTarget(type)) {
    errorList.push(new IncorrectTargetTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const target: Incomplete<CronTarget> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'listener': {
        const value = getServiceListener(member.value, errorList);

        if (value) {
          target.listener = value;
        }

        break;
      }

      case 'handler':
        target.handler = getTargetHandler(member.value, reflection, errorList);
        break;

      case 'timeout':
      case 'memory': {
        const value = getPropertyNumber(member);

        if (isAnyNumber(value)) {
          target[member.name] = value;
        }

        break;
      }

      case 'variables':
        target.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (isValidTarget(target)) {
    return target;
  }

  errorList.push(new IncompleteTargetError([...properties], type.file));

  return null;
};
