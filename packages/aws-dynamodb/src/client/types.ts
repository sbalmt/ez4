import type { ObjectSchema } from '@ez4/schema';

export type Repository = {
  tableName: string;
  tableIndexes: string[][];
  tableSchema: ObjectSchema;
};
