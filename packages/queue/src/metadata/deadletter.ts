import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { QueueDeadLetter } from '../types/common.js';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getReferenceType,
  getPropertyNumber
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteDeadLetterError, IncorrectDeadLetterTypeError, InvalidDeadLetterTypeError } from '../errors/deadletter.js';
import { isQueueDeadLetter } from './utils.js';

export const getQueueDeadLetter = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeDeadLetter(type, parent, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeDeadLetter(statement, parent, errorList);
  }

  return null;
};

const isValidDeadLetter = (type: Incomplete<QueueDeadLetter>): type is QueueDeadLetter => {
  return !!type.maxRetries;
};

const getTypeDeadLetter = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidDeadLetterTypeError(parent.file));
    return null;
  }

  if (!isQueueDeadLetter(type)) {
    errorList.push(new IncorrectDeadLetterTypeError(type.name, type.file));
    return null;
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

      case 'maxRetries':
        if ((deadLetter[member.name] = getPropertyNumber(member))) {
          properties.delete(member.name);
        }
        break;
    }
  }

  if (isValidDeadLetter(deadLetter)) {
    return deadLetter;
  }

  errorList.push(new IncompleteDeadLetterError([...properties], type.file));

  return null;
};
