import type { AllType, SourceMap, TypeClass, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { WsConnect } from './types';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

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
import { getHttpAuthorizer } from '../http/authorizer';
import { getHttpHandler } from '../http/handler';

export const isWsConnectDeclaration = (type: AllType): type is TypeClass => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Ws.Connect');
};

export const getWsConnect = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getConnectType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getConnectType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isCompleteWsConnect = (type: Incomplete<WsConnect>): type is WsConnect => {
  return !!type.handler;
};

const getConnectType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isWsConnectDeclaration(type)) {
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
  const route: Incomplete<WsConnect> = {};
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
        if ((route.handler = getHttpHandler(member.value, parent, reflection, errorList, false))) {
          properties.delete(member.name);
        }
        break;

      case 'authorizer':
        route.authorizer = getHttpAuthorizer(member.value, parent, reflection, errorList);
        break;

      case 'memory':
      case 'logRetention':
      case 'timeout':
        route[member.name] = getPropertyNumber(member);
        break;

      case 'listener':
        route.listener = getServiceListener(member.value, errorList);
        break;

      case 'variables':
        route.variables = getLinkedVariableList(member, errorList);
        break;
    }
  }

  if (isCompleteWsConnect(route)) {
    return route;
  }

  errorList.push(new IncompleteRouteError([...properties], type.file));

  return undefined;
};
