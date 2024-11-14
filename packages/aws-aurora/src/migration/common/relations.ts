import type { TableRelation } from '@ez4/database/library';
import type { RepositoryRelations } from '../../types/repository.js';

import { toCamelCase } from '@ez4/utils';

export const prepareCreateRelations = (table: string, relations: RepositoryRelations) => {
  const statements = [];

  for (const alias in relations) {
    const relation = relations[alias];

    if (!relation?.foreign) {
      continue;
    }

    const { sourceTable, sourceColumn, targetColumn } = relation;

    const relationName = getRelationName(table, relation);

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

export const prepareUpdateRelations = (
  table: string,
  toCreate: RepositoryRelations,
  toRemove: RepositoryRelations
) => {
  return [...prepareDeleteRelations(table, toRemove), ...prepareCreateRelations(table, toCreate)];
};

export const prepareDeleteRelations = (table: string, relations: RepositoryRelations) => {
  const statements = [];

  for (const alias in relations) {
    const relation = relations[alias];

    if (!relation?.foreign) {
      continue;
    }

    const relationName = getRelationName(table, relation);

    statements.push(`ALTER TABLE "${table}" DROP CONSTRAINT "${relationName}"`);
  }

  return statements;
};

const getRelationName = (table: string, relation: TableRelation) => {
  const targetAlias = toCamelCase(relation.targetAlias);

  return `${table}_${targetAlias}_fk`;
};
