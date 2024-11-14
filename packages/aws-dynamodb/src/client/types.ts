import type { ObjectSchema } from '@ez4/schema';

export type Repository = Record<string, RepositoryTable>;

export type RepositoryTable = {
  name: string;
  indexes: string[][];
  schema: ObjectSchema;
};
