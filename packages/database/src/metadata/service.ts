import type { ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { DatabaseService } from '../types/service.js';
import type { DatabaseTable } from '../types/table.js';
import type { TableIndex } from '../types/indexes.js';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalStatement,
  getLinkedServiceList,
  getLinkedVariableList,
  getPropertyTuple,
  getModelMembers
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { InvalidRelationAliasError, InvalidRelationColumnError, InvalidRelationTableError } from '../errors/relations.js';
import { IncompleteServiceError } from '../errors/service.js';
import { ServiceType } from '../types/service.js';
import { getDatabaseEngine } from './engine.js';
import { isDatabaseService } from './utils.js';
import { getDatabaseTable } from './table.js';

export const getDatabaseServices = (reflection: SourceMap) => {
  const allServices: Record<string, DatabaseService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isDatabaseService(statement) || isExternalStatement(statement)) {
      continue;
    }

    const service: Incomplete<DatabaseService> = { type: ServiceType, extras: {} };
    const properties = new Set(['engine', 'tables']);

    const fileName = statement.file;

    service.name = statement.name;

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        default:
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'engine':
          if ((service.engine = getDatabaseEngine(member.value, statement, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'tables':
          if ((service.tables = getAllTables(member, statement, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'variables':
          service.variables = getLinkedVariableList(member, errorList);
          break;

        case 'services':
          service.services = getLinkedServiceList(member, reflection, errorList);
          break;
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], fileName));
      continue;
    }

    const relationErrors = validateRelations(statement, service.tables);

    if (relationErrors.length) {
      errorList.push(...relationErrors);
      continue;
    }

    if (allServices[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, fileName));
      continue;
    }

    allServices[statement.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<DatabaseService>): type is DatabaseService => {
  return !!type.name && !!type.tables && !!type.extras;
};

const getAllTables = (member: ModelProperty, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  const tableItems = getPropertyTuple(member) ?? [];
  const tableList: DatabaseTable[] = [];

  for (const subscription of tableItems) {
    const result = getDatabaseTable(subscription, parent, reflection, errorList);

    if (result) {
      tableList.push(result);
    }
  }

  return tableList;
};

const validateRelations = (type: TypeObject | TypeModel, tables: DatabaseTable[]) => {
  const tablesMap = getTableMap(tables);
  const errorList = [];

  for (const { relations, schema, indexes: targetIndexes } of tables) {
    if (!relations) {
      continue;
    }

    const targetColumns = schema.properties;

    for (const relation of relations) {
      const { sourceTable, sourceColumn, targetColumn, targetAlias } = relation;

      if (!targetColumns[targetColumn]) {
        errorList.push(new InvalidRelationColumnError(targetColumn, type.file));
      }

      if (targetColumns[targetAlias]) {
        errorList.push(new InvalidRelationAliasError(targetAlias, type.file));
      }

      const sourceColumns = tablesMap[sourceTable]?.schema.properties;

      if (!sourceColumns) {
        errorList.push(new InvalidRelationTableError(sourceTable, type.file));
      }

      if (sourceColumns && !sourceColumns[sourceColumn]) {
        errorList.push(new InvalidRelationColumnError(sourceColumn, type.file));
      }

      const sourceIndexes = tablesMap[sourceTable]?.indexes ?? [];

      relation.sourceIndex = getIndexType(sourceIndexes, sourceColumn);
      relation.targetIndex = getIndexType(targetIndexes, targetColumn);
    }
  }

  return errorList;
};

const getIndexType = (indexes: TableIndex[], columnName: string) => {
  return indexes.find(({ name }) => name === columnName)?.type;
};

const getTableMap = (tables: DatabaseTable[]) => {
  return tables.reduce<Record<string, DatabaseTable | undefined>>((map, table) => {
    return {
      ...map,
      [table.name]: table
    };
  }, {});
};
