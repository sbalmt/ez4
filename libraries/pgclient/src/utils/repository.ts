import type { DatabaseTable, TableIndex, TableRelation } from '@ez4/database/library';
import type { PgTableRepository, PgIndexRepository, PgRelationRepository } from '../types/repository';

import { Index } from '@ez4/database';

import { getTableName } from './resources';

export const getTableRepository = (tables: DatabaseTable[]): PgTableRepository => {
  return tables.reduce((current, { name, schema, relations, indexes }) => {
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
  const indexes: PgIndexRepository = {};

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
  const relations: PgRelationRepository = {};

  for (const relation of tableRelations) {
    const { sourceColumn, sourceIndex, targetColumn, targetIndex } = relation;

    relations[relation.targetAlias] = {
      sourceTable: relation.sourceTable,
      sourceColumn,
      sourceIndex,
      targetColumn,
      targetIndex
    };
  }

  return relations;
};
