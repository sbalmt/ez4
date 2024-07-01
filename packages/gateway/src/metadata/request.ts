import type { HttpRequest } from '../types/request.js';

import type {
  AllType,
  EveryMemberType,
  SourceMap,
  TypeCallback,
  TypeFunction,
  TypeModel,
  TypeObject
} from '@ez4/reflection';

import { isModelDeclaration, getModelMembers, getObjectMembers } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectRequestTypeError, InvalidRequestTypeError } from '../errors/request.js';
import { getHttpParameters } from './parameters.js';
import { isHttpRequest } from './utils.js';
import { getHttpQuery } from './query.js';
import { getHttpBody } from './body.js';

type TypeParent = TypeModel | TypeCallback | TypeFunction;

export const getHttpRequest = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeRequest(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeRequest(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeRequest = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRequestTypeError(parent.file));
    return null;
  }

  if (!isHttpRequest(type)) {
    errorList.push(new IncorrectRequestTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: EveryMemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const request: HttpRequest = {};

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    switch (member.name) {
      case 'query': {
        request.query = getHttpQuery(member.value, type, reflection, errorList);

        if (request.query && member.description) {
          request.query.description = member.description;
        }

        break;
      }

      case 'parameters': {
        request.parameters = getHttpParameters(member.value, type, reflection, errorList);

        if (request.parameters && member.description) {
          request.parameters.description = member.description;
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
