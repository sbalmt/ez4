import type { TableSchema } from './schema.js';

export type DatabaseTable = {
  name: string;
  schema: TableSchema;
};
