import type { PgTableRepository, PgRelationRepository, PgRelationRepositoryWithSchema } from '../types/repository.js';

import { MissingRepositoryTableError } from '@ez4/pgclient';

export const getRelationsWithSchema = (tableName: string, repository: PgTableRepository) => {
  const relationsWithSchema: PgRelationRepositoryWithSchema = {};
  const tableAliasCache = new Set<string>();

  const buildRelationsWithSchema = (tableName: string, relations: PgRelationRepository) => {
    for (const relationAlias in relations) {
      const relationPath = `${tableName}.${relationAlias}`;

      if (tableAliasCache.has(relationPath)) {
        continue;
      }

      const tableRelation = relations[relationAlias];

      if (!tableRelation) {
        throw new MissingRepositoryTableError(relationAlias);
      }

      const sourceTable = tableRelation.sourceTable;
      const sourceRepository = repository[sourceTable];

      if (!sourceRepository) {
        throw new MissingRepositoryTableError(sourceTable);
      }

      relationsWithSchema[relationPath] = {
        ...tableRelation,
        sourceSchema: sourceRepository.schema,
        targetAlias: relationAlias,
        targetTable: tableName
      };

      tableAliasCache.add(relationPath);

      buildRelationsWithSchema(sourceTable, sourceRepository.relations);
    }
  };

  const { relations: tableRelations } = repository[tableName];

  buildRelationsWithSchema(tableName, tableRelations);

  return relationsWithSchema;
};
