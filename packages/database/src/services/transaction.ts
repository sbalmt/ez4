import type { AnyObject } from '@ez4/utils';

import type { TableIndex, TableRelation } from './table.js';
import type { RelationMetadata, RelationTables } from './relations.js';
import type { IndexedTables } from './indexes.js';
import type { TransactionType } from './engine.js';
import type { TableSchemas } from './schemas.js';
import type { Database } from './database.js';
import type { Client } from './client.js';
import type { Query } from './query.js';

/**
 * Transaction builder types.
 */
export namespace Transaction {
  /**
   * Extract the operation result from an interactive transaction.
   */
  export type Result<O> = O extends (client: any) => infer R ? R : void;

  /**
   * Determines the transaction operation based on the given database service.
   */
  export type Operation<T extends Database.Service, R> = T['engine'] extends { transaction: infer O }
    ? O extends TransactionType.Interactive
      ? WriteOperation<T> | InteractiveOperation<T, R>
      : WriteOperation<T>
    : never;

  /**
   * Interactive operations.
   */
  export type InteractiveOperation<T extends Database.Service, R = void> = (client: Client<T>) => Promise<R> | R;

  /**
   * Write operations.
   */
  export type WriteOperation<T extends Database.Service> = {
    [P in keyof TableSchemas<T>]?: (TableSchemas<T>[P] extends Database.Schema
      ? AnyOperation<TableSchemas<T>[P], TableIndex<P, IndexedTables<T>>, TableRelation<P, RelationTables<T>>>
      : AnyObject)[];
  };

  type AnyOperation<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata> =
    | InsertOperation<T, R>
    | UpdateOperation<T, I, R>
    | DeleteOperation<T, I, R>;

  type InsertOperation<T extends Database.Schema, R extends RelationMetadata> = {
    insert: Omit<Query.InsertOneInput<T, Query.SelectInput<T, R>, R>, 'select'>;
  };

  type UpdateOperation<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata> = {
    update: Omit<Query.UpdateOneInput<T, Query.SelectInput<T, R>, I, R>, 'select' | 'include'>;
  };

  type DeleteOperation<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata> = {
    delete: Omit<Query.DeleteOneInput<T, Query.SelectInput<T, R>, I, R>, 'select' | 'include'>;
  };
}
