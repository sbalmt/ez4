import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { TableRelation } from '../types/relations.js';

import { isModelDeclaration, getModelMembers, getObjectMembers, getPropertyString, getReferenceType } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectRelationsTypeError, InvalidRelationsTypeError, InvalidRelationTargetError } from '../errors/relations.js';

import { isTableRelations } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getTableRelations = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeRelations(type, parent, errorList);
  }

  const statement = getReferenceType(type, reflection);

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

const getTypeFromMembers = (type: TypeObject | TypeModel, members: MemberType[], errorList: Error[]) => {
  const relations: TableRelation[] = [];

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    const relationSource = getPropertyString(member);
    const relationTarget = member.name;

    if (!relationSource) {
      errorList.push(new InvalidRelationTargetError(relationTarget, type.file));
      return null;
    }

    const [targetColumn, targetAlias] = relationTarget.split('@', 2);
    const [sourceTable, sourceColumn] = relationSource.split(':', 2);

    relations.push({
      sourceTable,
      sourceColumn,
      targetColumn,
      targetAlias
    });
  }

  return relations;
};
