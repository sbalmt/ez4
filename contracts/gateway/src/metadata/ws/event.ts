import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { WsEvent } from './types';

import { isModelProperty, isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  hasHeritageType,
  getObjectMembers,
  getModelMembers,
  getReferenceType
} from '@ez4/common/library';

import { IncorrectEventTypeError, InvalidEventTypeError } from '../../errors/ws/event';
import { getHttpIdentity } from '../identity';
import { getHttpBody } from '../body';

export const getWsEvent = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]): WsEvent | undefined => {
  if (isTypeIntersection(type) && type.elements.length > 0) {
    return getWsEvent(type.elements[0], parent, reflection, errorList);
  }

  if (!isTypeReference(type)) {
    return getEventType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getEventType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getEventType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidEventTypeError(parent.file));
    return undefined;
  }

  if (!hasHeritageType(type, 'Ws.Event')) {
    errorList.push(new IncorrectEventTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel | TypeIntersection,
  parent: TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const request: WsEvent = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'identity': {
        request.identity = getHttpIdentity(member.value, type, reflection, errorList);

        if (request.identity && member.description) {
          request.identity.description = member.description;
        }

        break;
      }

      case 'body': {
        request.body = getHttpBody(member.value, type, reflection, errorList);

        if (request.body && member.description) {
          request.body.description = member.description;
        }

        break;
      }
    }
  }

  return request;
};
