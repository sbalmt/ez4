import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { TableIndex } from '../types/indexes.js';

import {
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  IncorrectIndexesTypeError,
  InvalidIndexesTypeError,
  InvalidIndexTypeError
} from '../errors/indexes.js';

import { Index } from '../services/indexes.js';
import { isTableIndexes } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getTableIndexes = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeIndexes(type, parent, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeIndexes(statement, parent, errorList);
  }

  return null;
};

const getTypeIndexes = (type: AllType, parent: TypeParent, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidIndexesTypeError(parent.file));
    return null;
  }

  if (!isTableIndexes(type)) {
    errorList.push(new IncorrectIndexesTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  errorList: Error[]
) => {
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
        return null;
    }
  }

  return indexes;
};
