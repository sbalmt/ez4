import type { Incomplete } from '@ez4/utils';
import type { AllType, EveryMemberType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { DatabaseTable } from '../types/table.js';

import { getModelMembers, getObjectMembers, getPropertyString } from '@ez4/common/library';
import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteTableError } from '../errors/table.js';
import { getTableSchema } from './schema.js';
import { isDatabaseTable } from './utils.js';

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

const isValidSubscription = (type: Incomplete<DatabaseTable>): type is DatabaseTable => {
  return !!type.name && !!type.schema;
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
  members: EveryMemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const table: Incomplete<DatabaseTable> = {};
  const properties = new Set(['name', 'schema']);

  for (const member of members) {
    if (!isModelProperty(member)) {
      continue;
    }

    switch (member.name) {
      case 'name':
        if ((table.name = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;

      case 'schema': {
        if ((table.schema = getTableSchema(member.value, type, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }
    }
  }

  if (isValidSubscription(table)) {
    return table;
  }

  errorList.push(new IncompleteTableError([...properties], type.file));

  return null;
};
