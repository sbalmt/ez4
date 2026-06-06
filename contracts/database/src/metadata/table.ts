import type { AllType, EveryType, ModelProperty, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { ObjectSchema } from '@ez4/schema';
import type { Incomplete } from '@ez4/utils';
import type { DatabaseTable, TableIndex } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  getReferenceType,
  getPropertyTuple,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference, isTypeTuple } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteTableError, IncorrectTableTypeError, InvalidTableTypeError } from '../errors/table';
import { InvalidIndexReferenceError } from '../errors/indexes';
import { getTableRelationsMetadata } from './relations';
import { getTableIndexesMetadata } from './indexes';
import { getTableSchemaMetadata } from './schema';
import { getTableStreamMetadata } from './stream';

export const isDatabaseTableDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Database.Table');
};

export const getDatabaseTablesMetadata = (member: ModelProperty, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(member.value)) {
    return getTableFromTuple(getPropertyTuple(member) ?? [], parent, reflection, errorList);
  }

  const declaration = getReferenceType(member.value, reflection);

  if (declaration && isTypeTuple(declaration)) {
    return getTableFromTuple(declaration.elements, parent, reflection, errorList);
  }

  return undefined;
};

const getTableFromTuple = (tableItems: EveryType[], parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  const tableList: DatabaseTable[] = [];

  for (const table of tableItems) {
    const result = getTypeFromTable(table, parent, reflection, errorList);

    if (Array.isArray(result)) {
      tableList.push(...result);
    } else if (result) {
      tableList.push(result);
    }
  }

  return tableList;
};

const getTypeFromTable = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTableType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTableType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isCompleteTable = (type: Incomplete<DatabaseTable>): type is DatabaseTable => {
  return isObjectWith(type, ['name', 'schema', 'indexes']);
};

const getTableType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  if (isTypeTuple(type) && type.spread) {
    return getTableFromTuple(type.elements, parent, reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidTableTypeError(parent.file));
    return undefined;
  }

  if (!isDatabaseTableDeclaration(type)) {
    errorList.push(new IncorrectTableTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const table: Incomplete<DatabaseTable> = {};
  const properties = new Set(['name', 'schema', 'indexes']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'name': {
        if ((table.name = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'schema': {
        if ((table.schema = getTableSchemaMetadata(member.value, type, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'indexes': {
        if ((table.indexes = getTableIndexesMetadata(member.value, type, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'relations': {
        table.relations = getTableRelationsMetadata(member.value, type, reflection, errorList);
        break;
      }

      case 'stream': {
        table.stream = getTableStreamMetadata(member.value, parent, reflection, errorList);
        break;
      }
    }
  }

  if (!isCompleteTable(table)) {
    errorList.push(new IncompleteTableError([...properties], type.file));
    return undefined;
  }

  const indexErrors = validateIndexes(type, table.indexes, table.schema);

  if (indexErrors.length) {
    errorList.push(...indexErrors);
    return undefined;
  }

  return table;
};

const validateIndexes = (type: TypeObject | TypeModel, indexes: TableIndex[], schema: ObjectSchema) => {
  const allColumns = schema.properties;
  const errorList = [];

  for (const { name, columns } of indexes) {
    const hasMissing = columns.some((columnName) => !allColumns[columnName]);

    if (hasMissing) {
      errorList.push(new InvalidIndexReferenceError(name, type.file));
    }
  }

  return errorList;
};
