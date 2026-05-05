import type { AllType, ReflectionTypes, TypeModel } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { CdnRewrite } from './types';

import {
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectRewriteTypeError, InvalidRewriteTypeError } from '../errors/rewrite';
import { getFormattedUri } from './utils/uri';

export const isCdnRewriteMetadata = (type: AllType) => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Cdn.Rewrite');
};

export const getCndRewriteMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getRewriteType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getRewriteType(declaration, parent, errorList);
  }

  return undefined;
};

const getRewriteType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(getObjectMembers(type));
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRewriteTypeError(parent.file));
    return undefined;
  }

  if (!isCdnRewriteMetadata(type)) {
    errorList.push(new IncorrectRewriteTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(getModelMembers(type));
};

const getTypeFromMembers = (members: MemberType[]) => {
  const rewrite: CdnRewrite = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    const location = getPropertyString(member);
    const path = getFormattedUri(member.name);

    if (location) {
      rewrite[path] = getFormattedUri(location);
    }
  }

  return rewrite;
};
