/**
 * Stream change for `insert`, `update` or `delete` operations.
 */
export type StreamChange<T> = StreamInsertChange<T> | StreamUpdateChange<T> | StreamDeleteChange<T>;

/**
 * Stream change for an `insert` operation.
 */
export type StreamInsertChange<T> = {
  type: StreamType.Insert;
  record: T;
};

/**
 * Stream change for an `update` operation.
 */
export type StreamUpdateChange<T> = {
  type: StreamType.Update;
  oldRecord: T;
  newRecord: T;
};

/**
 * Stream change for an `delete` operation.
 */
export type StreamDeleteChange<T> = {
  type: StreamType.Delete;
  record: T;
};

/**
 * Stream change types.
 */
export const enum StreamType {
  Insert = 'insert',
  Update = 'update',
  Delete = 'delete'
}
