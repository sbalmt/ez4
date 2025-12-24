import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { ObjectSchema } from '@ez4/schema';
import type { Incomplete } from '@ez4/utils';
import type { DatabaseTable } from '../types/table';
import type { TableIndex } from '../types/indexes';

import { InvalidServicePropertyError, getModelMembers, getObjectMembers, getPropertyString, getReferenceType } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteTableError } from '../errors/table';
import { InvalidIndexReferenceError } from '../errors/indexes';
import { getTableRelations } from './relations';
import { getTableIndexes } from './indexes';
import { isDatabaseTable } from './utils';
import { getTableSchema } from './schema';
import { getTableStream } from './stream';

export const getDatabaseTable = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeTable(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeTable(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isValidTable = (type: Incomplete<DatabaseTable>): type is DatabaseTable => {
  return !!type.name && !!type.schema && !!type.indexes;
};

const getTypeTable = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isDatabaseTable(type)) {
    return getTypeFromMembers(type, parent, getModelMembers(type), reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  return undefined;
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
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'name':
        if ((table.name = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;

      case 'schema':
        if ((table.schema = getTableSchema(member.value, type, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'indexes':
        if ((table.indexes = getTableIndexes(member.value, type, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'relations':
        table.relations = getTableRelations(member.value, type, reflection, errorList);
        break;

      case 'stream':
        table.stream = getTableStream(member.value, parent, reflection, errorList);
        break;
    }
  }

  if (!isValidTable(table)) {
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
