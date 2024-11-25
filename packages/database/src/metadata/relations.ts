import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { TableRelation } from '../types/relations.js';

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
  InvalidRelationTargetError
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
  const relations: TableRelation[] = [];

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    const relationTarget = getPropertyString(member);

    if (!relationTarget) {
      errorList.push(new InvalidRelationTargetError(member.name, type.file));
      return null;
    }

    const [sourceTable, sourceColumn] = member.name.split(':', 2);
    const [targetColumn, targetAlias] = relationTarget.split('@', 2);

    relations.push({
      foreign: false,
      sourceTable,
      sourceColumn,
      targetColumn,
      targetAlias
    });
  }

  return relations;
};
