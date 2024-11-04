import type { ObjectSchema } from '@ez4/schema';

export type Repository = {
  tableName: string;
  tableSchema: ObjectSchema;
  tableIndexes: string[][];
};
