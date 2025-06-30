/**
 * Determines whether or not the given value is a valid string.
 *
 * @param value Value to check.
 * @returns Returns `true` for a valid string, `false` otherwise.
 */
export const isAnyString = (value: unknown): value is string => {
  return typeof value === 'string';
};
