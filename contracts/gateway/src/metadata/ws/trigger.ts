import type { AllType, SourceMap, TypeClass, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { WsTrigger } from './types';

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

import { IncompleteRouteError } from '../../errors/route';
import { getWsHandler } from './handler';

export const isWsTriggerDeclaration = (type: AllType): type is TypeClass => {
  return isModelDeclaration(type) && (hasHeritageType(type, 'Ws.Disconnect') || hasHeritageType(type, 'Ws.Data'));
};

export const getWsTrigger = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTriggerType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTriggerType(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteWsTrigger = (type: Incomplete<WsTrigger>): type is WsTrigger => {
  return !!type.handler;
};

const getTriggerType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isWsTriggerDeclaration(type)) {
    return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  return undefined;
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const route: Incomplete<WsTrigger> = {};
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
        if ((route.handler = getWsHandler(member.value, errorList))) {
          properties.delete(member.name);
        }
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

  if (isCompleteWsTrigger(route)) {
    return route;
  }

  errorList.push(new IncompleteRouteError([...properties], type.file));

  return undefined;
};
