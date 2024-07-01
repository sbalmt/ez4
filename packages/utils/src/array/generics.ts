/**
 * It resolves to `true` when the given array is empty or contains `undefined` in
 * its first item, `false` otherwise.
 */
export type IsArrayEmpty<T extends any[]> = T[0] extends undefined ? true : false;

/**
 * Given an array, return all items, except the first one.
 */
export type ArrayRest<T extends any[]> = ((...unfold: T) => void) extends (
  skip: any,
  ...fold: infer R
) => void
  ? R
  : never;
