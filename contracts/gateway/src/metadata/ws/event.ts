import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { WsEvent } from './types';

import { isModelProperty, isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getObjectMembers,
  getModelMembers,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { IncorrectEventTypeError, InvalidEventTypeError } from '../../errors/ws/event';
import { getAuthIdentityMetadata } from '../auth/identity';
import { getFullTypeName } from '../utils/name';
import { getWebHeadersMetadata } from '../headers';
import { getWebQueryMetadata } from '../query';
import { WsNamespaceType } from './types';

const FULL_BASE_TYPE = getFullTypeName(WsNamespaceType, 'Event');

export const isWsEventDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, FULL_BASE_TYPE);
};

export const getWsEventMetadata = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]): WsEvent | undefined => {
  if (isTypeIntersection(type) && type.elements.length > 0) {
    return getWsEventMetadata(type.elements[0], parent, reflection, errorList);
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
    errorList.push(new InvalidEventTypeError(FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  if (!isWsEventDeclaration(type)) {
    errorList.push(new IncorrectEventTypeError(type.name, FULL_BASE_TYPE, type.file));
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

      case 'headers': {
        request.headers = getWebHeadersMetadata(member.value, type, reflection, errorList, WsNamespaceType);

        if (request.headers && member.description) {
          request.headers.description = member.description;
        }

        break;
      }

      case 'identity': {
        request.identity = getAuthIdentityMetadata(member.value, type, reflection, errorList, WsNamespaceType);

        if (request.identity && member.description) {
          request.identity.description = member.description;
        }

        break;
      }

      case 'query': {
        request.query = getWebQueryMetadata(member.value, type, reflection, errorList, WsNamespaceType);

        if (request.query && member.description) {
          request.query.description = member.description;
        }

        break;
      }
    }
  }

  return request;
};
