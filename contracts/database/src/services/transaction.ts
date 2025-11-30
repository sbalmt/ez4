import type { TableIndex, TableMetadata, TableRelation } from './table';
import type { RelationTables } from './relations';
import type { IndexedTables } from './indexes';
import type { EngineUtils } from './engine';
import type { TableSchemas } from './schemas';
import type { Database } from './contract';
import type { Client } from './client';
import type { Query } from './query';

/**
 * Transaction mode.
 */
export const enum TransactionMode {
  Interactive = 'interactive',
  Static = 'static'
}

/**
 * Transaction mode utils.
 */
export namespace TransactionModeUtils {
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
      ? AnyOperationType<{
          schema: TableSchemas<T>[P];
          indexes: TableIndex<P, IndexedTables<T>>;
          relations: TableRelation<P, RelationTables<T>>;
          engine: T['engine'];
        }>
      : never)[];
  };

  type AnyOperationType<T extends TableMetadata> = InsertOperationType<T> | UpdateOperationType<T> | DeleteOperationType<T>;

  type InsertOperationType<T extends TableMetadata> = {
    insert: Omit<Query.InsertOneInput<Query.SelectInput<T>, T>, 'select'>;
  };

  type UpdateOperationType<T extends TableMetadata> = {
    update: Omit<Query.UpdateOneInput<Query.SelectInput<T>, T>, 'select' | 'include'>;
  };

  type DeleteOperationType<T extends TableMetadata> = {
    delete: Omit<Query.DeleteOneInput<Query.SelectInput<T>, T>, 'select' | 'include'>;
  };
}
