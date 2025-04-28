import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { BucketEvent } from '../types/common.js';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLinkedVariableList,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyString,
  getServiceListener,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteEventError, IncorrectEventTypeError, InvalidEventTypeError } from '../errors/event.js';
import { getEventHandler } from './handler.js';
import { isBucketEvent } from './utils.js';

export const getBucketEvent = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeEvent(type, parent, reflection, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeEvent(statement, parent, reflection, errorList);
  }

  return null;
};

const isValidEvent = (type: Incomplete<BucketEvent>): type is BucketEvent => {
  return !!type.handler;
};

const getTypeEvent = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidEventTypeError(parent.file));
    return null;
  }

  if (!isBucketEvent(type)) {
    errorList.push(new IncorrectEventTypeError(type.name, type.file));
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
  const event: Incomplete<BucketEvent> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'path':
        event.path = getPropertyString(member);
        break;

      case 'listener':
        event.listener = getServiceListener(member.value, errorList);
        break;

      case 'handler':
        event.handler = getEventHandler(member.value, reflection, errorList);
        break;

      case 'memory':
      case 'timeout':
      case 'retention':
        event[member.name] = getPropertyNumber(member);
        break;

      case 'variables':
        event.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (isValidEvent(event)) {
    return event;
  }

  errorList.push(new IncompleteEventError([...properties], type.file));

  return null;
};
