import type { Incomplete } from '@ez4/utils';
import type { ObjectSchema } from '@ez4/schema';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { TableIndexes } from '../types/indexes.js';
import type { DatabaseTable } from '../types/table.js';

import { getModelMembers, getObjectMembers, getPropertyString } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteTableError } from '../errors/table.js';
import { InvalidIndexReferenceError } from '../errors/indexes.js';
import { isDatabaseTable } from './utils.js';
import { getTableRelations } from './relations.js';
import { getTableIndexes } from './indexes.js';
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

      case 'indexes': {
        if ((table.indexes = getTableIndexes(member.value, type, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'schema': {
        if ((table.schema = getTableSchema(member.value, type, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'stream': {
        table.stream = getTableStream(member.value, type, reflection, errorList);
        break;
      }
    }
  }

  if (!isValidTable(table)) {
    errorList.push(new IncompleteTableError([...properties], type.file));
    return null;
  }

  const indexErrors = validateIndexSchema(type, table.indexes, table.schema);

  if (indexErrors.length) {
    errorList.push(...indexErrors);
    return null;
  }

  return table;
};

const validateIndexSchema = (
  type: TypeObject | TypeModel,
  indexes: TableIndexes,
  schema: ObjectSchema
) => {
  const allColumns = schema.properties;
  const errorList = [];

  for (const indexName in indexes) {
    const indexColumns = indexName.split(':');

    const hasMissing = indexColumns.some((columnName) => !allColumns[columnName]);

    if (hasMissing) {
      errorList.push(new InvalidIndexReferenceError(indexName, type.file));
    }
  }

  return errorList;
};
