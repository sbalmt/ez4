import type { ArchitectureType, RuntimeType } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { TableStreamHandler, TableStreamListener } from './common';
import type { TableSchema } from './schemas';

/**
 * Database table stream.
 */
export interface TableStream<T extends TableSchema> {
  /**
   * Life-cycle listener function for the stream.
   */
  readonly listener?: TableStreamListener<T>;

  /**
   * Entry-point handler function for the stream.
   */
  readonly handler: TableStreamHandler<T>;

  /**
   * Variables associated to the handler.
   */
  readonly variables?: LinkedVariables;

  /**
   * Architecture for the stream function.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Runtime for the stream function.
   */
  readonly runtime?: RuntimeType;

  /**
   * Log retention (in days) for the handler.
   */
  readonly logRetention?: number;

  /**
   * Max execution time (in seconds) for the handler.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;
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
  readonly type: StreamChangeType.Insert;

  /**
   * Inserted record.
   */
  readonly record: T;
};

/**
 * Stream change for an `update` operation.
 */
export type StreamUpdateChange<T> = {
  /**
   * Change type.
   */
  readonly type: StreamChangeType.Update;

  /**
   * Previous record.
   */
  readonly oldRecord: T;

  /**
   * Current record.
   */
  readonly newRecord: T;
};

/**
 * Stream change for an `delete` operation.
 */
export type StreamDeleteChange<T> = {
  /**
   * Change type.
   */
  readonly type: StreamChangeType.Delete;

  /**
   * Deleted record.
   */
  readonly record: T;
};
