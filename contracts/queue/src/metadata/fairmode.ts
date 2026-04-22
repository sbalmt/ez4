import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { QueueFairMode } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteFairModeError, IncorrectFairModeTypeError, InvalidFairModeTypeError } from '../errors/fairmode';

export const isQueueFairModeDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Queue.FairMode');
};

export const getQueueFairModeMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getFairModeType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getFairModeType(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteFairMode = (type: Incomplete<QueueFairMode>): type is QueueFairMode => {
  return isObjectWith(type, ['groupId']);
};

const getFairModeType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidFairModeTypeError(parent.file));
    return undefined;
  }

  if (!isQueueFairModeDeclaration(type)) {
    errorList.push(new IncorrectFairModeTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const fairMode: Incomplete<QueueFairMode> = {};
  const properties = new Set(['groupId']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'groupId': {
        if ((fairMode[member.name] = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;
      }
    }
  }

  if (!isCompleteFairMode(fairMode)) {
    errorList.push(new IncompleteFairModeError([...properties], type.file));
    return undefined;
  }

  return fairMode;
};
