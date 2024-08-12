import type { TableSchema } from './schema.js';
import type { TableIndexes } from './indexes.js';
import type { TableStream } from './stream.js';

export type DatabaseTable = {
  name: string;
  schema: TableSchema;
  indexes: TableIndexes;
  stream?: TableStream;
};
