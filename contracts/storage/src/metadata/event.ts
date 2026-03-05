import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { BucketEvent } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLinkedVariableList,
  getObjectMembers,
  getModelMembers,
  getReferenceType,
  getPropertyNumber,
  getPropertyString,
  getPropertyStringList,
  getPropertyBoolean,
  getServiceListener,
  getServiceArchitecture,
  getServiceLogLevel,
  getServiceRuntime,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteEventError, IncorrectEventTypeError, InvalidEventTypeError } from '../errors/event';
import { getEventHandlerMetadata } from './handler';

export const isBucketEventDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Bucket.Event');
};

export const getBucketEventMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeEvent(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeEvent(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteEvent = (type: Incomplete<BucketEvent>): type is BucketEvent => {
  return isObjectWith(type, ['handler']);
};

const getTypeEvent = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidEventTypeError(parent.file));
    return undefined;
  }

  if (!isBucketEventDeclaration(type)) {
    errorList.push(new IncorrectEventTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const event: Incomplete<BucketEvent> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'path': {
        event.path = getPropertyString(member);
        break;
      }

      case 'handler': {
        event.handler = getEventHandlerMetadata(member.value, errorList);
        break;
      }

      case 'memory':
      case 'timeout':
      case 'logRetention': {
        event[member.name] = getPropertyNumber(member);
        break;
      }

      case 'logLevel': {
        event[member.name] = getServiceLogLevel(member);
        break;
      }

      case 'architecture': {
        event[member.name] = getServiceArchitecture(member);
        break;
      }

      case 'runtime': {
        event[member.name] = getServiceRuntime(member);
        break;
      }

      case 'vpc': {
        event[member.name] = getPropertyBoolean(member);
        break;
      }

      case 'files': {
        event[member.name] = getPropertyStringList(member);
        break;
      }

      case 'listener': {
        event.listener = getServiceListener(member.value, errorList);
        break;
      }

      case 'variables': {
        event.variables = getLinkedVariableList(member, errorList);
        break;
      }
    }
  }

  if (!isCompleteEvent(event)) {
    errorList.push(new IncompleteEventError([...properties], type.file));
    return undefined;
  }

  return event;
};
