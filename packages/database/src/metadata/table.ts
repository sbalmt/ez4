import type { Incomplete } from '@ez4/utils';
import type { ObjectSchema } from '@ez4/schema';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { DatabaseTable } from '../types/table.js';
import type { TableIndex } from '../types/indexes.js';

import {
  InvalidServicePropertyError,
  getModelMembers,
  getObjectMembers,
  getPropertyString
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteTableError } from '../errors/table.js';
import { InvalidIndexReferenceError } from '../errors/indexes.js';
import { getTableRelations } from './relations.js';
import { getTableIndexes } from './indexes.js';
import { isDatabaseTable } from './utils.js';
import { getTableSchema } from './schema.js';
import { getTableStream } from './stream.js';

export const getDatabaseTable = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeTable(type, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeTable(statement, reflection, errorList);
  }

  return null;
};

const isValidTable = (type: Incomplete<DatabaseTable>): type is DatabaseTable => {
  return !!type.name && !!type.schema && !!type.indexes;
};

const getTypeTable = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (isDatabaseTable(type)) {
    return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  return null;
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  reflection: SourceMap,
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

      case 'relations': {
        const relations = getTableRelations(member.value, type, reflection, errorList);

        if (relations) {
          table.relations = relations;
        }

        break;
      }

      case 'indexes':
        if ((table.indexes = getTableIndexes(member.value, type, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'schema':
        if ((table.schema = getTableSchema(member.value, type, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;

      case 'stream':
        table.stream = getTableStream(member.value, type, reflection, errorList);
        break;
    }
  }

  if (!isValidTable(table)) {
    errorList.push(new IncompleteTableError([...properties], type.file));
    return null;
  }

  const indexErrors = validateIndexes(type, table.indexes, table.schema);

  if (indexErrors.length) {
    errorList.push(...indexErrors);
    return null;
  }

  return table;
};

const validateIndexes = (
  type: TypeObject | TypeModel,
  indexes: TableIndex[],
  schema: ObjectSchema
) => {
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
