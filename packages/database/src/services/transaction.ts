import type { Indexes, TableIndexes } from './indexes.js';
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
            | InsertOperation<TableSchemas<T>[P]>
            | UpdateOperation<
                TableSchemas<T>[P],
                P extends keyof TableIndexes<T>
                  ? TableIndexes<T>[P] extends Indexes
                    ? TableIndexes<T>[P]
                    : never
                  : never
              >
            | DeleteOperation<
                TableSchemas<T>[P],
                P extends keyof TableIndexes<T>
                  ? TableIndexes<T>[P] extends Indexes
                    ? TableIndexes<T>[P]
                    : never
                  : never
              >;
        }
      : never;
  };

  type InsertOperation<T extends Database.Schema> = {
    insert: Query.InsertOneInput<T>;
  };

  type UpdateOperation<T extends Database.Schema, I extends Indexes> = {
    update: Omit<Query.UpdateOneInput<T, Query.SelectInput<T>, I>, 'select'>;
  };

  type DeleteOperation<T extends Database.Schema, I extends Indexes> = {
    delete: Omit<Query.DeleteOneInput<T, Query.SelectInput<T>, I>, 'select'>;
  };
}
