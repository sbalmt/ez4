import type { AllType, ReflectionTypes, TypeClass, TypeModel, TypeObject } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { DatabaseService } from './types';
import type { DatabaseTable } from './types';
import type { TableIndex } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getLinkedOptionsObject,
  getLinkedVariablesObject,
  getLinkedServicesObject,
  getDeclarationDescription,
  getModelMembers,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteServiceError } from '../errors/service';
import { InvalidRelationAliasError, InvalidRelationColumnError, InvalidRelationTableError } from '../errors/relations';
import { getDatabaseScalabilityMetadata } from './scalability';
import { getDatabaseEngineMetadata } from './engine';
import { getDatabaseTablesMetadata } from './table';
import { createDatabaseService } from './types';

export const isDatabaseServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Database.Service');
};

export const getDatabaseServicesMetadata = (reflection: ReflectionTypes) => {
  const allServices: Record<string, DatabaseService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isDatabaseServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const { file: fileName } = declaration;

    const service = createDatabaseService(declaration.name, getDeclarationDescription(declaration));
    const properties = new Set(['engine', 'tables']);

    for (const member of getModelMembers(declaration, true)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        default: {
          if (!member.inherited) {
            errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          }
          break;
        }

        case 'client':
          break;

        case 'scalability': {
          if (!member.inherited) {
            service.scalability = getDatabaseScalabilityMetadata(member.value, declaration, reflection, errorList);
          }
          break;
        }

        case 'engine': {
          if ((service.engine = getDatabaseEngineMetadata(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'tables': {
          if (!member.inherited && (service.tables = getDatabaseTablesMetadata(member, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'options': {
          if (!member.inherited) {
            service.options = getLinkedOptionsObject(member);
          }
          break;
        }

        case 'variables': {
          if (!member.inherited) {
            service.variables = getLinkedVariablesObject(member, errorList);
          }
          break;
        }

        case 'services': {
          if (!member.inherited) {
            service.services = getLinkedServicesObject(member, reflection, errorList);
          }
          break;
        }
      }
    }

    if (!isCompleteService(service)) {
      errorList.push(new IncompleteServiceError([...properties], fileName));
      continue;
    }

    const relationErrors = validateRelations(declaration, service.tables);

    if (relationErrors.length) {
      errorList.push(...relationErrors);
      continue;
    }

    if (allServices[declaration.name]) {
      errorList.push(new DuplicateServiceError(declaration.name, fileName));
      continue;
    }

    allServices[declaration.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isCompleteService = (type: Incomplete<DatabaseService>): type is DatabaseService => {
  return isObjectWith(type, ['engine', 'tables', 'variables', 'services']);
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
