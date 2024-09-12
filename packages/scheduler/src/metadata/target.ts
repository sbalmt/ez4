import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { CronTarget } from '../types/target.js';

import {
  getLinkedVariables,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  isModelDeclaration
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

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
    return getTypeTarget(type, parent, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeTarget(statement, parent, errorList);
  }

  return null;
};

const isValidTarget = (type: Incomplete<CronTarget>): type is CronTarget => {
  return !!type.handler;
};

const getTypeTarget = (type: AllType, parent: TypeParent, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidTargetTypeError(parent.file));
    return null;
  }

  if (!isCronTarget(type)) {
    errorList.push(new IncorrectTargetTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  errorList: Error[]
) => {
  const stream: Incomplete<CronTarget> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'handler':
        stream.handler = getTargetHandler(member.value, errorList);
        break;

      case 'timeout':
      case 'memory': {
        const value = getPropertyNumber(member);
        if (value !== undefined && value !== null) {
          stream[member.name] = value;
        }
        break;
      }

      case 'variables':
        stream.variables = getLinkedVariables(member, errorList);
        break;
    }
  }

  if (isValidTarget(stream)) {
    return stream;
  }

  errorList.push(new IncompleteTargetError([...properties], type.file));

  return null;
};
