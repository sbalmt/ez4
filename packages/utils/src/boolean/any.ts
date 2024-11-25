/**
 * Determines whether or not the given value is a valid boolean.
 *
 * @param value Value to check.
 * @returns Returns true for a valid boolean, false otherwise.
 */
export const isAnyBoolean = (value: unknown): value is number => {
  return typeof value === 'boolean';
};
