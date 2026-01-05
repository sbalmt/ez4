import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { DatabaseScalability } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getPropertyNumber,
  getObjectMembers,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber, isObjectWith } from '@ez4/utils';

import { IncompleteScalabilityError, IncorrectScalabilityTypeError, InvalidScalabilityTypeError } from '../errors/scalability';

export const isDatabaseScalabilityDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Database.Scalability');
};

export const getDatabaseScalabilityMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeScalability(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeScalability(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteScalability = (type: Incomplete<DatabaseScalability>): type is DatabaseScalability => {
  return isObjectWith(type, ['minCapacity', 'maxCapacity']);
};

const getTypeScalability = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidScalabilityTypeError(parent.file));
    return undefined;
  }

  if (!isDatabaseScalabilityDeclaration(type)) {
    errorList.push(new IncorrectScalabilityTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const scalability: Incomplete<DatabaseScalability> = {};

  const properties = new Set(['minCapacity', 'maxCapacity']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'minCapacity':
      case 'maxCapacity': {
        const capacity = getPropertyNumber(member);

        if (isAnyNumber(capacity)) {
          scalability[member.name] = capacity;
          properties.delete(member.name);
        }

        break;
      }
    }
  }

  if (!isCompleteScalability(scalability)) {
    errorList.push(new IncompleteScalabilityError([...properties], type.file));
    return undefined;
  }

  return scalability;
};
