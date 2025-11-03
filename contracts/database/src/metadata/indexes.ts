import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { TableIndex } from '../types/indexes';

import { isModelDeclaration, getModelMembers, getObjectMembers, getPropertyString, getReferenceType } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectIndexesTypeError, InvalidIndexesTypeError, InvalidIndexTypeError } from '../errors/indexes';
import { Index } from '../services/indexes';
import { isTableIndexes } from './utils';

type TypeParent = TypeModel | TypeObject;

export const getTableIndexes = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeIndexes(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeIndexes(declaration, parent, errorList);
  }

  return undefined;
};

const getTypeIndexes = (type: AllType, parent: TypeParent, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidIndexesTypeError(parent.file));
    return undefined;
  }

  if (!isTableIndexes(type)) {
    errorList.push(new IncorrectIndexesTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, members: MemberType[], errorList: Error[]) => {
  const indexes: TableIndex[] = [];

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    const indexName = member.name;
    const indexType = getPropertyString(member);

    switch (indexType) {
      case Index.Primary:
      case Index.Secondary:
      case Index.Unique:
      case Index.TTL:
        indexes.push({
          name: indexName,
          columns: indexName.split(':'),
          type: indexType
        });
        break;

      default:
        errorList.push(new InvalidIndexTypeError(indexName, type.file));
        return undefined;
    }
  }

  return indexes;
};
