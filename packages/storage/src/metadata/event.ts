import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { BucketEvent } from '../types/common.js';

import {
  getLinkedVariableList,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyString,
  isModelDeclaration
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import {
  IncompleteEventError,
  IncorrectEventTypeError,
  InvalidEventTypeError
} from '../errors/event.js';

import { getEventHandler } from './handler.js';
import { isBucketEvent } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getBucketEvent = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeEvent(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeEvent(statement, parent, reflection, errorList);
  }

  return null;
};

const isValidEvent = (type: Incomplete<BucketEvent>): type is BucketEvent => {
  return !!type.handler;
};

const getTypeEvent = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidEventTypeError(parent.file));
    return null;
  }

  if (!isBucketEvent(type)) {
    errorList.push(new IncorrectEventTypeError(type.name, type.file));
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
  const Event: Incomplete<BucketEvent> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'handler':
        Event.handler = getEventHandler(member.value, reflection, errorList);
        break;

      case 'path': {
        const value = getPropertyString(member);

        if (value) {
          Event[member.name] = value;
        }

        break;
      }

      case 'timeout':
      case 'memory': {
        const value = getPropertyNumber(member);

        if (isAnyNumber(value)) {
          Event[member.name] = value;
        }

        break;
      }

      case 'variables':
        Event.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (isValidEvent(Event)) {
    return Event;
  }

  errorList.push(new IncompleteEventError([...properties], type.file));

  return null;
};
