import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { TableStream } from '../types/stream.js';

import {
  getLinkedVariables,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  isModelDeclaration
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  IncompleteStreamError,
  IncorrectStreamTypeError,
  InvalidStreamTypeError
} from '../errors/stream.js';

import { getStreamHandler } from './handler.js';
import { isTableStream } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getTableStream = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeStream(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeStream(statement, parent, reflection, errorList);
  }

  return null;
};

const isValidStream = (type: Incomplete<TableStream>): type is TableStream => {
  return !!type.handler;
};

const getTypeStream = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidStreamTypeError(parent.file));
    return null;
  }

  if (!isTableStream(type)) {
    errorList.push(new IncorrectStreamTypeError(type.name, type.file));
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
  const stream: Incomplete<TableStream> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'handler':
        stream.handler = getStreamHandler(member.value, reflection, errorList);
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

  if (isValidStream(stream)) {
    return stream;
  }

  errorList.push(new IncompleteStreamError([...properties], type.file));

  return null;
};
