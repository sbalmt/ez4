import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { TopicFifoMode } from './types';

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

import { IncompleteFifoModeError, IncorrectFifoModeTypeError, InvalidFifoModeTypeError } from '../errors/fifo';

export const isTopicFifoModeDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Topic.FifoMode');
};

export const getTopicFifoModeMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getFifoModeType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getFifoModeType(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteFifoMode = (type: Incomplete<TopicFifoMode>): type is TopicFifoMode => {
  return isObjectWith(type, ['groupId']);
};

const getFifoModeType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidFifoModeTypeError(parent.file));
    return undefined;
  }

  if (!isTopicFifoModeDeclaration(type)) {
    errorList.push(new IncorrectFifoModeTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const fifoOptions: Incomplete<TopicFifoMode> = {};
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
        if ((fifoOptions[member.name] = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;
      }
    }
  }

  if (!isCompleteFifoMode(fifoOptions)) {
    errorList.push(new IncompleteFifoModeError([...properties], type.file));
    return undefined;
  }

  return fifoOptions;
};
