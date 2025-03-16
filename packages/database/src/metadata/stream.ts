import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { TableStream } from '../types/stream.js';

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

import { IncompleteStreamError, IncorrectStreamTypeError, InvalidStreamTypeError } from '../errors/stream.js';
import { getStreamHandler } from './handler.js';
import { isTableStream } from './utils.js';

export const getTableStream = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeStream(type, parent, reflection, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeStream(statement, parent, reflection, errorList);
  }

  return null;
};

const isValidStream = (type: Incomplete<TableStream>): type is TableStream => {
  return !!type.handler;
};

const getTypeStream = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidStreamTypeError(parent.file));
    return null;
  }

  if (!isTableStream(type)) {
    errorList.push(new IncorrectStreamTypeError(type.name, type.file));
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
  const stream: Incomplete<TableStream> = {};
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
        stream.handler = getStreamHandler(member.value, reflection, errorList);
        break;

      case 'listener':
        stream.listener = getServiceListener(member.value, errorList);
        break;

      case 'memory':
      case 'timeout':
        stream[member.name] = getPropertyNumber(member);
        break;

      case 'variables':
        stream.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (isValidStream(stream)) {
    return stream;
  }

  errorList.push(new IncompleteStreamError([...properties], type.file));

  return null;
};
