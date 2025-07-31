import type { PgRelationRepository } from '@ez4/pgclient/library';

import { getTableName } from '@ez4/pgclient/library';
import { toSnakeCase } from '@ez4/utils';
import { Index } from '@ez4/database';

export const prepareCreateRelations = (table: string, relations: PgRelationRepository) => {
  const statements = [];

  for (const alias in relations) {
    const relation = relations[alias];

    if (!relation || relation.targetIndex === Index.Primary) {
      continue;
    }

    const { sourceAlias, sourceColumn, targetColumn } = relation;

    const relationName = getRelationName(table, alias);
    const sourceTable = getTableName(sourceAlias);

    statements.push(
      `ALTER TABLE "${table}" ` +
        `ADD CONSTRAINT "${relationName}" ` +
        `FOREIGN KEY ("${targetColumn}") ` +
        `REFERENCES "${sourceTable}" ("${sourceColumn}") ` +
        `ON DELETE CASCADE ` +
        `ON UPDATE CASCADE`
    );
  }

  return statements;
};

export const prepareUpdateRelations = (table: string, toCreate: PgRelationRepository, toRemove: PgRelationRepository) => {
  return [...prepareDeleteRelations(table, toRemove), ...prepareCreateRelations(table, toCreate)];
};

export const prepareDeleteRelations = (table: string, relations: PgRelationRepository) => {
  const statements = [];

  for (const alias in relations) {
    const relation = relations[alias];

    if (!relation || relation.targetIndex === Index.Primary) {
      continue;
    }

    const relationName = getRelationName(table, alias);

    statements.push(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${relationName}"`);
  }

  return statements;
};

const getRelationName = (table: string, alias: string) => {
  return `${table}_${toSnakeCase(alias)}_fk`;
};
