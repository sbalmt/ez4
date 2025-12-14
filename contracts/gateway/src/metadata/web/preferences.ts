import type { AllType, SourceMap, TypeModel } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { WebPreferences } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getObjectMembers,
  getModelMembers,
  getReferenceType,
  getPropertyStringIn,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { NamingStyle } from '@ez4/schema';

import { IncorrectPreferencesTypeError, InvalidPreferencesTypeError } from '../../errors/web/preferences';
import { getFullTypeName } from '../utils/type';

const BASE_TYPE = 'Preferences';

export const isWebPreferencesDeclaration = (type: TypeModel, namespace: string) => {
  return hasHeritageType(type, getFullTypeName(namespace, BASE_TYPE));
};

export const getWebPreferencesMetadata = (
  type: AllType,
  parent: TypeModel,
  reflection: SourceMap,
  errorList: Error[],
  namespace: string
) => {
  if (!isTypeReference(type)) {
    return getPreferencesType(type, parent, errorList, namespace);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getPreferencesType(declaration, parent, errorList, namespace);
  }

  return undefined;
};

const getPreferencesType = (type: AllType, parent: TypeModel, errorList: Error[], namespace: string) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidPreferencesTypeError(getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  if (!isWebPreferencesDeclaration(type, namespace)) {
    errorList.push(new IncorrectPreferencesTypeError(type.name, getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  return getTypeFromMembers(parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const preferences: WebPreferences = {};

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, parent.file));
        break;

      case 'namingStyle':
        preferences.namingStyle = getPropertyStringIn(member, [
          NamingStyle.Preserve,
          NamingStyle.CamelCase,
          NamingStyle.PascalCase,
          NamingStyle.SnakeCase,
          NamingStyle.KebabCase
        ]);

        break;
    }
  }

  return preferences;
};
