import type { Relations, RelationTables } from './relations.js';
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
    [P in keyof TableSchemas<T>]?: TableSchemas<T>[P] extends Database.Schema
      ? {
          [alias: string]:
            | InsertOperation<TableSchemas<T>[P], TableRelation<P, RelationTables<T>>>
            | UpdateOperation<
                TableSchemas<T>[P],
                TableIndex<P, IndexedTables<T>>,
                TableRelation<P, RelationTables<T>>
              >
            | DeleteOperation<
                TableSchemas<T>[P],
                TableIndex<P, IndexedTables<T>>,
                TableRelation<P, RelationTables<T>>
              >;
        }
      : never;
  };

  type InsertOperation<T extends Database.Schema, R extends Relations> = {
    insert: Query.InsertOneInput<T, R>;
  };

  type UpdateOperation<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = {
    update: Omit<Query.UpdateOneInput<T, Query.SelectInput<T, R>, I, R>, 'select'>;
  };

  type DeleteOperation<
    T extends Database.Schema,
    I extends Database.Indexes<T>,
    R extends Relations
  > = {
    delete: Omit<Query.DeleteOneInput<T, Query.SelectInput<T, R>, I>, 'select'>;
  };
}
