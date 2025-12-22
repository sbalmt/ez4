import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { TableRelation } from '../types/relations';

import { isModelDeclaration, getModelMembers, getObjectMembers, getPropertyString, getReferenceType } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectRelationsTypeError, InvalidRelationsTypeError, InvalidRelationTargetError } from '../errors/relations';
import { isTableRelations } from './utils';

type TypeParent = TypeModel | TypeObject;

export const getTableRelations = (type: AllType, parent: TypeParent, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeRelations(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeRelations(declaration, parent, errorList);
  }

  return undefined;
};

const getTypeRelations = (type: AllType, parent: TypeParent, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRelationsTypeError(parent.file));
    return undefined;
  }

  if (!isTableRelations(type)) {
    errorList.push(new IncorrectRelationsTypeError(type.name, type.file));
    return undefined;
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
      return undefined;
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
