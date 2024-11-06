import type { TableRelations } from './relations.js';
import type { TableIndexes } from './indexes.js';
import type { TableSchema } from './schema.js';
import type { TableStream } from './stream.js';

export type DatabaseTable = {
  name: string;
  schema: TableSchema;
  relations?: TableRelations;
  indexes: TableIndexes;
  stream?: TableStream;
};
