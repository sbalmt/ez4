import type { AnyObject } from '@ez4/utils';
import type { TableIndex, TableRelation } from './table.js';
import type { RelationMetadata, RelationTables } from './relations.js';
import type { IndexedTables } from './indexes.js';
import type { EngineUtils } from './engine.js';
import type { TableSchemas } from './schemas.js';
import type { Database } from './database.js';
import type { Client } from './client.js';
import type { Query } from './query.js';

/**
 * Transaction mode.
 */
export const enum TransactionMode {
  Interactive = 'interactive',
  Static = 'static'
}

/**
 * Transaction utils.
 */
export namespace TransactionUtils {
  /**
   * Extract the operation result from an interactive transaction.
   */
  export type Result<O> = O extends (client: any) => infer R ? R : void;

  /**
   * Determines the transaction operation based on the given database service.
   */
  export type Type<T extends Database.Service, R> =
    EngineUtils.GetTransactionMode<T> extends TransactionMode.Interactive
      ? StaticOperationType<T> | InteractiveOperationType<T, R>
      : StaticOperationType<T>;

  /**
   * Interactive operation type.
   */
  export type InteractiveOperationType<T extends Database.Service, R = void> = (client: Client<T>) => Promise<R> | R;

  /**
   * Static operation type.
   */
  export type StaticOperationType<T extends Database.Service> = {
    [P in keyof TableSchemas<T>]?: (TableSchemas<T>[P] extends Database.Schema
      ? AnyOperationType<TableSchemas<T>[P], TableIndex<P, IndexedTables<T>>, TableRelation<P, RelationTables<T>>, T['engine']>
      : AnyObject)[];
  };

  type AnyOperationType<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata, E extends Database.Engine> =
    | InsertOperationType<T, R>
    | UpdateOperationType<T, I, R, E>
    | DeleteOperationType<T, I, R, E>;

  type InsertOperationType<T extends Database.Schema, R extends RelationMetadata> = {
    insert: Omit<Query.InsertOneInput<T, Query.SelectInput<T, R>, R>, 'select'>;
  };

  type UpdateOperationType<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata, E extends Database.Engine> = {
    update: Omit<Query.UpdateOneInput<T, Query.SelectInput<T, R>, I, R, E>, 'select' | 'include'>;
  };

  type DeleteOperationType<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata, E extends Database.Engine> = {
    delete: Omit<Query.DeleteOneInput<T, Query.SelectInput<T, R>, I, R, E>, 'select' | 'include'>;
  };
}
