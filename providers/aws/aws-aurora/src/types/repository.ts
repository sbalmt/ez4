import type { TableIndex, TableRelation } from '@ez4/database/library';
import type { ObjectSchema } from '@ez4/schema';

export type Repository = Record<string, RepositoryTable>;

export type RepositoryRelations = Record<string, InternalRelation>;

export type RepositoryRelationsWithSchema = Record<string, RelationWithSchema>;

export type RepositoryIndexes = Record<string, TableIndex>;

export type RepositoryTable = {
  name: string;
  relations: RepositoryRelations;
  indexes: RepositoryIndexes;
  schema: ObjectSchema;
};

export type RelationWithSchema = InternalRelation & {
  sourceSchema: ObjectSchema;
  sourceTable: string;
};

type InternalRelation = Omit<TableRelation, 'targetAlias' | 'sourceTable'> & {
  sourceAlias: string;
};
