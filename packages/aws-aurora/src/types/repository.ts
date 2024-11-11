import type { TableIndex, TableRelation } from '@ez4/database/library';
import type { ObjectSchema } from '@ez4/schema';

export type Repository = Record<string, RepositoryTable>;

export type RepositoryRelations = Record<string, TableRelation | undefined>;

export type RepositoryIndexes = Record<string, TableIndex | undefined>;

export type RepositoryTable = {
  name: string;
  relations: RepositoryRelations;
  indexes: RepositoryIndexes;
  schema: ObjectSchema;
};
