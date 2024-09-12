import type { Incomplete } from '@ez4/utils';
import type { ModelProperty, SourceMap } from '@ez4/reflection';
import type { DatabaseTable } from '../types/table.js';
import type { DatabaseService } from '../types/service.js';

import {
  getLinkedServices,
  getLinkedVariables,
  getModelMembers,
  getPropertyTuple
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

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
    const properties = new Set(['tables']);

    service.name = statement.name;

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        case 'tables':
          if ((service.tables = getAllTables(member, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'variables':
          service.variables = getLinkedVariables(member, errorList);
          break;

        case 'services':
          service.services = getLinkedServices(member, reflection, errorList);
          break;
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], statement.file));
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
