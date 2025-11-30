import type { AllType, SourceMap, TypeModel } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { HttpPreferences } from '../types/common';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getObjectMembers,
  getModelMembers,
  getReferenceType,
  getPropertyStringIn
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { NamingStyle } from '@ez4/schema';

import { IncorrectPreferencesTypeError, InvalidPreferencesTypeError } from '../errors/preferences';
import { isHttpPreferences } from './utils';

export const getHttpPreferences = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypePreferences(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypePreferences(declaration, parent, errorList);
  }

  return undefined;
};

const getTypePreferences = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidPreferencesTypeError(parent.file));
    return undefined;
  }

  if (!isHttpPreferences(type)) {
    errorList.push(new IncorrectPreferencesTypeError(type.name, parent.file));
    return undefined;
  }

  return getTypeFromMembers(parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const preferences: HttpPreferences = {};

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
