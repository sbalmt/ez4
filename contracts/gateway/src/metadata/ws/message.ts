import type { AllType, ReflectionTypes, TypeClass, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { WsMessage } from './types';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLinkedVariableList,
  getPropertyNumber,
  getObjectMembers,
  getModelMembers,
  getReferenceType,
  getPropertyBoolean,
  getServiceListener,
  getServiceArchitecture,
  getServiceLogLevel,
  getServiceRuntime,
  hasHeritageType
} from '@ez4/common/library';

import { IncompleteTargetError } from '../../errors/ws/target';
import { getFullTypeName } from '../utils/name';
import { getWebPreferencesMetadata } from '../preferences';
import { getWsMessageHandler } from './handlers';
import { WsNamespaceType } from './types';

export const isWsMessageDeclaration = (type: AllType): type is TypeClass => {
  return isModelDeclaration(type) && hasHeritageType(type, getFullTypeName(WsNamespaceType, 'Message'));
};

export const getWsMessageMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getMessageType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getMessageType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isCompleteWsMessage = (type: Incomplete<WsMessage>): type is WsMessage => {
  return isObjectWith(type, ['handler']);
};

const getMessageType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isWsMessageDeclaration(type)) {
    return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  return undefined;
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const target: Incomplete<WsMessage> = {};
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
        if ((target.handler = getWsMessageHandler(member.value, parent, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'preferences': {
        target.preferences = getWebPreferencesMetadata(member.value, parent, reflection, errorList, WsNamespaceType);
        break;
      }

      case 'memory':
      case 'timeout':
      case 'logRetention': {
        target[member.name] = getPropertyNumber(member);
        break;
      }

      case 'logLevel': {
        target[member.name] = getServiceLogLevel(member);
        break;
      }

      case 'architecture': {
        target[member.name] = getServiceArchitecture(member);
        break;
      }

      case 'runtime': {
        target[member.name] = getServiceRuntime(member);
        break;
      }

      case 'vpc': {
        target[member.name] = getPropertyBoolean(member);
        break;
      }

      case 'listener': {
        target.listener = getServiceListener(member.value, errorList);
        break;
      }

      case 'variables': {
        target.variables = getLinkedVariableList(member, errorList);
        break;
      }
    }
  }

  if (!isCompleteWsMessage(target)) {
    errorList.push(new IncompleteTargetError([...properties], type.file));
    return undefined;
  }

  return target;
};
