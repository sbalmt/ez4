/**
 * Based on the given `T` objects, it returns a new object type allowing
 * its original type, `undefined` and `null` for all first-level properties.
 */
export type Incomplete<T> = {
  [P in keyof T]?: T[P] | null;
};
