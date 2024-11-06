import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { TableRelations } from '../types/relations.js';

import {
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  IncorrectRelationsTypeError,
  InvalidRelationsTypeError,
  InvalidRelationPatternError
} from '../errors/relations.js';

import { isTableRelations } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getTableRelations = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeRelations(type, parent, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeRelations(statement, parent, errorList);
  }

  return null;
};

const getTypeRelations = (type: AllType, parent: TypeParent, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRelationsTypeError(parent.file));
    return null;
  }

  if (!isTableRelations(type)) {
    errorList.push(new IncorrectRelationsTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  errorList: Error[]
) => {
  const relations: TableRelations = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    const relationTable = member.name;
    const relationFields = getPropertyString(member);

    if (!relationFields) {
      errorList.push(new InvalidRelationPatternError(relationTable, type.file));
      return null;
    }

    relations[relationTable] = relationFields;
  }

  return relations;
};
