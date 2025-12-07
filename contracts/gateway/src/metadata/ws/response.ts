import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { WsResponse } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  hasHeritageType,
  getModelMembers,
  getObjectMembers,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectResponseTypeError, InvalidResponseTypeError } from '../../errors/http/response';
import { getHttpBody } from '../body';

export const getWsResponse = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getResponseType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getResponseType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getResponseType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidResponseTypeError('Ws.Response', parent.file));
    return undefined;
  }

  if (!hasHeritageType(type, 'Ws.Response')) {
    errorList.push(new IncorrectResponseTypeError(type.name, 'Ws.Response', type.file));
    return undefined;
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
  const response: WsResponse = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'body': {
        response.body = getHttpBody(member.value, type, reflection, errorList);

        if (response.body && member.description) {
          response.body.description = member.description;
        }

        break;
      }
    }
  }

  return response;
};
