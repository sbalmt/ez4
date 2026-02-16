import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { TableStream } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLinkedVariableList,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getServiceListener,
  getServiceArchitecture,
  getServiceRuntime,
  getPropertyBoolean,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteStreamError, IncorrectStreamTypeError, InvalidStreamTypeError } from '../errors/stream';
import { getStreamHandlerMetadata } from './handler';

export const isTableStreamDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Database.Stream');
};

export const getTableStreamMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeStream(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeStream(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isCompleteStream = (type: Incomplete<TableStream>): type is TableStream => {
  return isObjectWith(type, ['handler']);
};

const getTypeStream = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidStreamTypeError(parent.file));
    return undefined;
  }

  if (!isTableStreamDeclaration(type)) {
    errorList.push(new IncorrectStreamTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const stream: Incomplete<TableStream> = {};
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

      case 'handler': {
        stream.handler = getStreamHandlerMetadata(member.value, reflection, errorList);
        break;
      }

      case 'memory':
      case 'logRetention':
      case 'timeout': {
        stream[member.name] = getPropertyNumber(member);
        break;
      }

      case 'architecture': {
        stream[member.name] = getServiceArchitecture(member);
        break;
      }

      case 'runtime': {
        stream[member.name] = getServiceRuntime(member);
        break;
      }

      case 'vpc': {
        stream[member.name] = getPropertyBoolean(member);
        break;
      }

      case 'listener': {
        stream.listener = getServiceListener(member.value, errorList);
        break;
      }

      case 'variables': {
        stream.variables = getLinkedVariableList(member, errorList);
        break;
      }
    }
  }

  if (!isCompleteStream(stream)) {
    errorList.push(new IncompleteStreamError([...properties], type.file));
    return undefined;
  }

  return stream;
};
