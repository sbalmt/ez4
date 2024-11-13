import type { DatabaseService, TableIndex, TableRelation } from '@ez4/database/library';
import type { Repository, RepositoryIndexes, RepositoryRelations } from '../types/repository.js';

import { toCamelCase } from '@ez4/utils';
import { Index } from '@ez4/database';

export const getRepository = (service: DatabaseService): Repository => {
  return service.tables.reduce<Repository>((current, { name, schema, relations, indexes }) => {
    return {
      ...current,
      [name]: {
        name: toCamelCase(name),
        indexes: getTableIndexes(indexes),
        relations: getTableRelations(relations ?? []),
        schema
      }
    };
  }, {});
};

const getTableIndexes = (tableIndexes: TableIndex[]) => {
  const indexes: RepositoryIndexes = {};

  for (const { name, columns, type } of tableIndexes) {
    if (type !== Index.Primary && type !== Index.Secondary) {
      continue;
    }

    indexes[name] = {
      name,
      columns,
      type
    };
  }

  return indexes;
};

const getTableRelations = (tableRelations: TableRelation[]) => {
  const relations: RepositoryRelations = {};

  for (const relation of tableRelations) {
    const { targetAlias, sourceColumn, sourceTable, targetColumn, foreign } = relation;

    relations[targetAlias] = {
      sourceAlias: sourceTable,
      sourceTable: toCamelCase(sourceTable),
      sourceColumn,
      targetColumn,
      targetAlias,
      foreign
    };
  }

  return relations;
};
