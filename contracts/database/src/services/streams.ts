/**
 * Stream change for `insert`, `update` or `delete` operations.
 */
export type StreamChange<T> = StreamInsertChange<T> | StreamUpdateChange<T> | StreamDeleteChange<T>;

/**
 * Stream change types.
 */
export const enum StreamType {
  Insert = 'insert',
  Update = 'update',
  Delete = 'delete'
}

/**
 * Stream change for an `insert` operation.
 */
export type StreamInsertChange<T> = {
  /**
   * Change type.
   */
  type: StreamType.Insert;

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
  type: StreamType.Update;

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
  type: StreamType.Delete;

  /**
   * Deleted record.
   */
  record: T;
};
