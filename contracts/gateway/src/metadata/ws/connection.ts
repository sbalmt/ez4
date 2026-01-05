import type { AllType, ReflectionTypes, TypeClass, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { WsConnection } from './types';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import {
  InvalidServicePropertyError,
  getLinkedVariableList,
  getPropertyNumber,
  getObjectMembers,
  getModelMembers,
  getServiceListener,
  getServiceArchitecture,
  getServiceRuntime,
  getReferenceType,
  isModelDeclaration,
  hasHeritageType
} from '@ez4/common/library';

import { IncompleteTargetError } from '../../errors/ws/target';
import { getAuthHandlerMetadata } from '../auth/handler';
import { getFullTypeName } from '../utils/name';
import { getWebPreferencesMetadata } from '../preferences';
import { getWsConnectionHandler } from './handlers';
import { WsNamespaceType } from './types';

const FULL_BASE_CONNECT_TYPE = getFullTypeName(WsNamespaceType, 'Connect');

const FULL_BASE_DISCONNECT_TYPE = getFullTypeName(WsNamespaceType, 'Disconnect');

export const isWsConnectionDeclaration = (type: AllType): type is TypeClass => {
  return isModelDeclaration(type) && (hasHeritageType(type, FULL_BASE_CONNECT_TYPE) || hasHeritageType(type, FULL_BASE_DISCONNECT_TYPE));
};

export const getWsConnectionMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getConnectionType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getConnectionType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isCompleteWsConnection = (type: Incomplete<WsConnection>): type is WsConnection => {
  return isObjectWith(type, ['handler']);
};

const getConnectionType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isWsConnectionDeclaration(type)) {
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
  const target: Incomplete<WsConnection> = {};
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
        if ((target.handler = getWsConnectionHandler(member.value, parent, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'authorizer': {
        target.authorizer = getAuthHandlerMetadata(member.value, parent, reflection, errorList, WsNamespaceType);
        break;
      }

      case 'preferences': {
        target.preferences = getWebPreferencesMetadata(member.value, parent, reflection, errorList, WsNamespaceType);
        break;
      }

      case 'memory':
      case 'logRetention':
      case 'timeout': {
        target[member.name] = getPropertyNumber(member);
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

  if (!isCompleteWsConnection(target)) {
    errorList.push(new IncompleteTargetError([...properties], type.file));
    return undefined;
  }

  return target;
};
