import type { AnyObject } from '@ez4/utils';
import type { RelationMetadata, RelationTables } from './relations.js';
import type { TableIndex, TableRelation } from './table.js';
import type { IndexedTables } from './indexes.js';
import type { TableSchemas } from './schemas.js';
import type { Database } from './database.js';
import type { Query } from './query.js';

/**
 * Transaction builder types.
 */
export namespace Transaction {
  /**
   * Write operations.
   */
  export type WriteOperations<T extends Database.Service<any>> = {
    [P in keyof TableSchemas<T>]?: (TableSchemas<T>[P] extends Database.Schema
      ? AnyOperation<
          TableSchemas<T>[P],
          TableIndex<P, IndexedTables<T>>,
          TableRelation<P, RelationTables<T>>
        >
      : AnyObject)[];
  };

  type AnyOperation<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = InsertOperation<T, R> | UpdateOperation<T, I, R> | DeleteOperation<T, I, R>;

  type InsertOperation<T extends Database.Schema, R extends RelationMetadata> = {
    insert: Query.InsertOneInput<T, R>;
  };

  type UpdateOperation<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = {
    update: Omit<Query.UpdateOneInput<T, Query.SelectInput<T, R>, I, R>, 'select' | 'include'>;
  };

  type DeleteOperation<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends RelationMetadata
  > = {
    delete: Omit<Query.DeleteOneInput<T, Query.SelectInput<T, R>, I, R>, 'select' | 'include'>;
  };
}
