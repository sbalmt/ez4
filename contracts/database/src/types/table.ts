import type { TableRelation } from './relations';
import type { TableIndex } from './indexes';
import type { TableSchema } from './schema';
import type { TableStream } from './stream';

export type DatabaseTable = {
  name: string;
  schema: TableSchema;
  relations?: TableRelation[];
  indexes: TableIndex[];
  stream?: TableStream;
};
