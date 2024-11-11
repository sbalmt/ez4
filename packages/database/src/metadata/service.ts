import type { Incomplete } from '@ez4/utils';
import type { ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { DatabaseService } from '../types/service.js';
import type { DatabaseTable } from '../types/table.js';

import {
  getLinkedServiceList,
  getLinkedVariableList,
  getPropertyString,
  getPropertyTuple,
  getModelMembers
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import {
  InvalidRelationAliasError,
  InvalidRelationColumnError,
  InvalidRelationTableError
} from '../errors/relations.js';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { isDatabaseService } from './utils.js';
import { getDatabaseTable } from './table.js';

export const getDatabaseServices = (reflection: SourceMap) => {
  const dbServices: Record<string, DatabaseService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isDatabaseService(statement)) {
      continue;
    }

    const service: Incomplete<DatabaseService> = { type: ServiceType };
    const properties = new Set(['engine', 'tables']);

    service.name = statement.name;

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        case 'engine': {
          if ((service.engine = getPropertyString(member))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'tables':
          if ((service.tables = getAllTables(member, reflection, errorList))) {
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
      errorList.push(new IncompleteServiceError([...properties], statement.file));
      continue;
    }

    const relationErrors = validateRelations(statement, service.tables);

    if (relationErrors.length) {
      errorList.push(...relationErrors);
      continue;
    }

    dbServices[statement.name] = service;
  }

  return {
    services: dbServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<DatabaseService>): type is DatabaseService => {
  return !!type.name && !!type.tables;
};

const getAllTables = (member: ModelProperty, reflection: SourceMap, errorList: Error[]) => {
  const tableItems = getPropertyTuple(member) ?? [];
  const tableList: DatabaseTable[] = [];

  for (const subscription of tableItems) {
    const result = getDatabaseTable(subscription, reflection, errorList);

    if (result) {
      tableList.push(result);
    }
  }

  return tableList;
};

const validateRelations = (type: TypeObject | TypeModel, tables: DatabaseTable[]) => {
  const errorList = [];

  for (const { relations, schema } of tables) {
    if (!relations) {
      continue;
    }

    const targetColumns = schema.properties;

    for (const relation of relations) {
      const { sourceTable, sourceColumn, targetColumn, targetAlias } = relation;

      const sourceColumns = tables.find(({ name }) => name === sourceTable)?.schema.properties;

      if (!targetColumns[targetColumn]) {
        errorList.push(new InvalidRelationColumnError(targetColumn, type.file));
      }

      if (targetColumns[targetAlias]) {
        errorList.push(new InvalidRelationAliasError(targetAlias, type.file));
      }

      if (!sourceColumns) {
        errorList.push(new InvalidRelationTableError(sourceTable, type.file));
      }

      if (sourceColumns && !sourceColumns[sourceColumn]) {
        errorList.push(new InvalidRelationColumnError(sourceColumn, type.file));
      }
    }
  }

  return errorList;
};
