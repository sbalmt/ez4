import type { TableIndex, TableRelation } from '@ez4/database/library';
import type { ObjectSchema } from '@ez4/schema';

export type Repository = Record<string, RepositoryTable>;

export type RepositoryRelations = Record<string, InternalRelation | undefined>;

export type RepositoryRelationsWithSchema = Record<string, InternalRelationWithSchema | undefined>;

export type RepositoryIndexes = Record<string, TableIndex | undefined>;

export type RepositoryTable = {
  name: string;
  relations: RepositoryRelations;
  indexes: RepositoryIndexes;
  schema: ObjectSchema;
};

type InternalRelation = TableRelation & {
  sourceAlias: string;
};

type InternalRelationWithSchema = InternalRelation & {
  sourceSchema: ObjectSchema;
};
