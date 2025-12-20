import type { AllType, SourceMap, TypeModel } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import { HttpNamespaceType, type HttpDefaults } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  tryGetReferenceType,
  getPropertyNumber,
  getObjectMembers,
  getModelMembers,
  getServiceListener,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectDefaultsTypeError, InvalidDefaultsTypeError } from '../../errors/defaults';
import { getFullTypeName } from '../utils/name';
import { getWebPreferencesMetadata } from '../preferences';
import { getHttpErrorsMetadata } from './errors';

const FULL_BASE_TYPE = getFullTypeName(HttpNamespaceType, 'Defaults');

export const isHttpDefaultsDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, FULL_BASE_TYPE);
};

export const getHttpDefaultsMetadata = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getDefaultsType(type, parent, reflection, errorList);
  }

  const declaration = tryGetReferenceType(type, reflection);

  if (declaration) {
    return getDefaultsType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getDefaultsType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidDefaultsTypeError(FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  if (!isHttpDefaultsDeclaration(type)) {
    errorList.push(new IncorrectDefaultsTypeError(type.name, FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  return getTypeFromMembers(parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (parent: TypeModel, members: MemberType[], reflection: SourceMap, errorList: Error[]) => {
  const defaults: HttpDefaults = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, parent.file));
        break;

      case 'preferences':
        defaults.preferences = getWebPreferencesMetadata(member.value, parent, reflection, errorList, HttpNamespaceType);
        break;

      case 'httpErrors':
        defaults.httpErrors = getHttpErrorsMetadata(member.value, parent, reflection, errorList);
        break;

      case 'memory':
      case 'logRetention':
      case 'timeout':
        defaults[member.name] = getPropertyNumber(member);
        break;

      case 'listener':
        defaults.listener = getServiceListener(member.value, errorList);
        break;
    }
  }

  return defaults;
};
