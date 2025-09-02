import type { TableIndex, TableRelation } from '@ez4/database/library';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

export type PgTableRepository = Record<string, PgTableMetadata>;

export type PgTableMetadata = {
  name: string;
  relations: PgRelationRepository;
  indexes: PgIndexRepository;
  schema: ObjectSchema;
};

export type PgRelationRepository = Record<string, PgRelationMetadata>;

export type PgRelationMetadata = Omit<TableRelation, 'targetAlias'>;

export type PgRelationRepositoryWithSchema = Record<string, PgRelationWithSchema>;

export type PgRelationWithSchema = TableRelation & {
  sourceSchema: ObjectSchema;
  targetTable: string;
};

export type PgIndexRepository = Record<string, TableIndex>;

export const isTableMetadata = (input: AnyObject): input is PgTableMetadata => {
  return 'name' in input && 'indexes' in input && 'relations' in input && 'schema' in input;
};
