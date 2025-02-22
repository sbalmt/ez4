import type { DatabaseService, TableIndex, TableRelation } from '@ez4/database/library';
import type { Repository, RepositoryIndexes, RepositoryRelations } from '../types/repository.js';

import { Index } from '@ez4/database';

import { getTableName } from '../utils/tables.js';

export const getRepository = (service: DatabaseService): Repository => {
  return service.tables.reduce<Repository>((current, { name, schema, relations, indexes }) => {
    return {
      ...current,
      [name]: {
        name: getTableName(name),
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
    if (type !== Index.Primary && type !== Index.Secondary && type !== Index.Unique) {
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
    const { sourceColumn, sourceIndex, targetColumn, targetIndex } = relation;

    relations[relation.targetAlias] = {
      sourceAlias: relation.sourceTable,
      sourceColumn,
      sourceIndex,
      targetColumn,
      targetIndex
    };
  }

  return relations;
};
