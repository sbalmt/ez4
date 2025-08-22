import type { TableIndex, TableRelation } from '@ez4/database/library';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

export type PgTableRepository = Record<string, RepositoryTable>;

export type PgRelationRepository = Record<string, InternalRelation>;

export type RepositoryRelationsWithSchema = Record<string, RelationWithSchema>;

export type PgIndexRepository = Record<string, TableIndex>;

export type RepositoryTable = {
  name: string;
  relations: PgRelationRepository;
  indexes: PgIndexRepository;
  schema: ObjectSchema;
};

export type RelationWithSchema = InternalRelation & {
  sourceSchema: ObjectSchema;
  sourceTable: string;
};

type InternalRelation = Omit<TableRelation, 'targetAlias' | 'sourceTable'> & {
  sourceAlias: string;
};

export const isRepositoryTable = (input: AnyObject): input is RepositoryTable => {
  return 'name' in input && 'indexes' in input && 'relations' in input && 'schema' in input;
};
