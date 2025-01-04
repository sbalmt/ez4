/**
 * Determines whether or not the given value is a valid number.
 *
 * @param value Value to check.
 * @returns Returns true for a valid number, false otherwise.
 */
export const isAnyNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !Number.isNaN(value);
};
