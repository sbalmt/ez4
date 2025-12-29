import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { QueueDeadLetter } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getReferenceType,
  getPropertyNumber,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteDeadLetterError, IncorrectDeadLetterTypeError, InvalidDeadLetterTypeError } from '../errors/deadletter';

export const isQueueDeadLetterDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Queue.DeadLetter');
};

export const getQueueDeadLetterMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getDeadLetterType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getDeadLetterType(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteDeadLetter = (type: Incomplete<QueueDeadLetter>): type is QueueDeadLetter => {
  return isObjectWith(type, ['maxRetries']);
};

const getDeadLetterType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidDeadLetterTypeError(parent.file));
    return undefined;
  }

  if (!isQueueDeadLetterDeclaration(type)) {
    errorList.push(new IncorrectDeadLetterTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const deadLetter: Incomplete<QueueDeadLetter> = {};
  const properties = new Set(['maxRetries']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'retention': {
        deadLetter[member.name] = getPropertyNumber(member);
        break;
      }

      case 'maxRetries': {
        if ((deadLetter[member.name] = getPropertyNumber(member))) {
          properties.delete(member.name);
        }
        break;
      }
    }
  }

  if (!isCompleteDeadLetter(deadLetter)) {
    errorList.push(new IncompleteDeadLetterError([...properties], type.file));
    return undefined;
  }

  return deadLetter;
};
