import type { AllType, SourceMap, TypeClass, TypeModel, TypeObject } from '@ez4/reflection';
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
  getReferenceType,
  isModelDeclaration,
  hasHeritageType
} from '@ez4/common/library';

import { IncompleteRouteError } from '../../errors/http/route';
import { getHttpPreferences } from '../preferences';
import { getHttpAuthorizer } from '../authorizer';
import { getWsConnectionHandler } from './handlers';

export const isWsConnectionDeclaration = (type: AllType): type is TypeClass => {
  return isModelDeclaration(type) && (hasHeritageType(type, 'Ws.Connect') || hasHeritageType(type, 'Ws.Disconnect'));
};

export const getWsConnection = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
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

const getConnectionType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
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
  reflection: SourceMap,
  errorList: Error[]
) => {
  const target: Incomplete<WsConnection> = {};
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
        if ((target.handler = getWsConnectionHandler(member.value, parent, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'authorizer':
        target.authorizer = getHttpAuthorizer(member.value, parent, reflection, errorList);
        break;

      case 'preferences':
        target.preferences = getHttpPreferences(member.value, parent, reflection, errorList);
        break;

      case 'memory':
      case 'logRetention':
      case 'timeout':
        target[member.name] = getPropertyNumber(member);
        break;

      case 'listener':
        target.listener = getServiceListener(member.value, errorList);
        break;

      case 'variables':
        target.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (isCompleteWsConnection(target)) {
    return target;
  }

  errorList.push(new IncompleteRouteError([...properties], type.file));

  return undefined;
};
