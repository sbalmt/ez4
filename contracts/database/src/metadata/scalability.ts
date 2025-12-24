import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { DatabaseScalability } from '../types/scalability';

import { InvalidServicePropertyError, getModelMembers, getPropertyNumber, getObjectMembers, getReferenceType } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import { IncompleteScalabilityError } from '../errors/scalability';
import { isDatabaseEngine } from './utils';

export const getDatabaseScalability = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeScalability(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeScalability(declaration, parent, errorList);
  }

  return undefined;
};

const isValidScalability = (type: Incomplete<DatabaseScalability>): type is DatabaseScalability => {
  return isAnyNumber(type.minCapacity) && isAnyNumber(type.maxCapacity);
};

const getTypeScalability = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isDatabaseEngine(type)) {
    return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  return undefined;
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const scalability: Incomplete<DatabaseScalability> = {};

  const properties = new Set(['minCapacity', 'maxCapacity']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'minCapacity':
      case 'maxCapacity':
        const capacity = getPropertyNumber(member);

        if (isAnyNumber(capacity)) {
          scalability[member.name] = capacity;
          properties.delete(member.name);
        }

        break;
    }
  }

  if (!isValidScalability(scalability)) {
    errorList.push(new IncompleteScalabilityError([...properties], type.file));
    return undefined;
  }

  return scalability;
};
