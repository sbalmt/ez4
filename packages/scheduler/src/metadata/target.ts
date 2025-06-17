import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CronTarget } from '../types/common.js';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLinkedVariableList,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getServiceListener,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteTargetError, IncorrectTargetTypeError, InvalidTargetTypeError } from '../errors/target.js';
import { getTargetHandler } from './handler.js';
import { isCronTarget } from './utils.js';

export const getCronTarget = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeTarget(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeTarget(declaration, parent, reflection, errorList);
  }

  return null;
};

const isValidTarget = (type: Incomplete<CronTarget>): type is CronTarget => {
  return !!type.handler;
};

const getTypeTarget = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidTargetTypeError(parent.file));
    return null;
  }

  if (!isCronTarget(type)) {
    errorList.push(new IncorrectTargetTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
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
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'handler':
        if ((target.handler = getTargetHandler(member.value, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'listener':
        target.listener = getServiceListener(member.value, errorList);
        break;

      case 'memory':
      case 'logRetention':
      case 'timeout':
        target[member.name] = getPropertyNumber(member);
        break;

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
