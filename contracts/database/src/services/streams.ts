import type { LinkedVariables } from '@ez4/project/library';
import type { TableStreamHandler, TableStreamListener } from './common';
import type { TableSchema } from './schemas';

/**
 * Database table stream.
 */
export interface TableStream<T extends TableSchema> {
  /**
   * Stream listener.
   */
  listener?: TableStreamListener<T>;

  /**
   * Stream handler.
   */
  handler: TableStreamHandler<T>;

  /**
   * Variables associated to the handler.
   */
  variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  logRetention?: number;

  /**
   * Max execution time (in seconds) for the handler.
   */
  timeout?: number;

  /**
   * Amount of memory available for the handler.
   */
  memory?: number;
}

/**
 * Stream change types.
 */
export const enum StreamChangeType {
  Insert = 'insert',
  Update = 'update',
  Delete = 'delete'
}

/**
 * Stream change for `insert`, `update` or `delete` operations.
 */
export type StreamAnyChange<T> = StreamInsertChange<T> | StreamUpdateChange<T> | StreamDeleteChange<T>;

/**
 * Stream change for an `insert` operation.
 */
export type StreamInsertChange<T> = {
  /**
   * Change type.
   */
  type: StreamChangeType.Insert;

  /**
   * Inserted record.
   */
  record: T;
};

/**
 * Stream change for an `update` operation.
 */
export type StreamUpdateChange<T> = {
  /**
   * Change type.
   */
  type: StreamChangeType.Update;

  /**
   * Previous record.
   */
  oldRecord: T;

  /**
   * Current record.
   */
  newRecord: T;
};

/**
 * Stream change for an `delete` operation.
 */
export type StreamDeleteChange<T> = {
  /**
   * Change type.
   */
  type: StreamChangeType.Delete;

  /**
   * Deleted record.
   */
  record: T;
};
