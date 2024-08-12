import type { Incomplete } from '@ez4/utils';
import type { AllType, EveryMemberType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { TableStream } from '../types/stream.js';

import {
  getLinkedVariables,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteStreamError } from '../errors/stream.js';
import { getStreamHandler } from './handler.js';
import { isTableStream } from './utils.js';

export const getTableStream = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeStream(type, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeStream(statement, reflection, errorList);
  }

  return null;
};

const isValidStream = (type: Incomplete<TableStream>): type is TableStream => {
  return !!type.handler;
};

const getTypeStream = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (isTableStream(type)) {
    return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  return null;
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: EveryMemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const stream: Incomplete<TableStream> = {};
  const properties = new Set(['handler']);

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    switch (member.name) {
      case 'timeout':
      case 'memory': {
        const value = getPropertyNumber(member);
        if (value !== undefined && value !== null) {
          stream[member.name] = value;
        }
        break;
      }

      case 'handler':
        stream.handler = getStreamHandler(member.value, reflection, errorList);
        break;

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
