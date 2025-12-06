import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpCors } from '../../types/common';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyBoolean,
  getPropertyStringList,
  getPropertyNumber,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteCorsError, IncorrectCorsTypeError, InvalidCorsTypeError } from '../../errors/http/cors';
import { isHttpCors } from './utils';

export const getHttpCors = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeCors(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeCors(declaration, parent, errorList);
  }

  return undefined;
};

const isValidCors = (type: Incomplete<HttpCors>): type is HttpCors => {
  return !!type.allowOrigins?.length;
};

const getTypeCors = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCorsTypeError(parent.file));
    return undefined;
  }

  if (!isHttpCors(type)) {
    errorList.push(new IncorrectCorsTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const cors: Incomplete<HttpCors> = {};
  const properties = new Set(['allowOrigins']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'allowOrigins':
      case 'allowMethods':
      case 'allowHeaders':
      case 'exposeHeaders':
        cors[member.name] = getPropertyStringList(member);
        break;

      case 'allowCredentials':
        cors.allowCredentials = getPropertyBoolean(member);
        break;

      case 'maxAge':
        cors.maxAge = getPropertyNumber(member);
        break;
    }
  }

  if (isValidCors(cors)) {
    return cors;
  }

  errorList.push(new IncompleteCorsError([...properties], type.file));

  return undefined;
};
