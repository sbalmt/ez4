/**
 * Check whether the given value is an array.
 *
 * @param value Value to check.
 * @returns Returns `true` for a given array, `false` otherwise.
 */
export const isAnyArray = (value: unknown): value is Array<unknown> => {
  return value instanceof Array;
};
