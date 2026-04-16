import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { QueueBackoff } from './types';

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

import { IncompleteBackoffError, IncorrectBackoffTypeError, InvalidBackoffTypeError } from '../errors/backoff';

export const isQueueBackoffDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Queue.Backoff');
};

export const getQueueBackoffMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getBackoffType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getBackoffType(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteBackoff = (type: Incomplete<QueueBackoff>): type is QueueBackoff => {
  return isObjectWith(type, ['maxDelay']);
};

const getBackoffType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidBackoffTypeError(parent.file));
    return undefined;
  }

  if (!isQueueBackoffDeclaration(type)) {
    errorList.push(new IncorrectBackoffTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const backoff: Incomplete<QueueBackoff> = {};
  const properties = new Set(['maxDelay']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'minDelay':
      case 'maxDelay': {
        if ((backoff[member.name] = getPropertyNumber(member))) {
          properties.delete(member.name);
        }
        break;
      }
    }
  }

  if (!isCompleteBackoff(backoff)) {
    errorList.push(new IncompleteBackoffError([...properties], type.file));
    return undefined;
  }

  return backoff;
};
