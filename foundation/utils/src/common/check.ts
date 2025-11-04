/**
 * Determines whether the given value is `null` or `undefined`.
 *
 * @param value Value to check.
 * @returns Returns `true` when the value is nullish, `false` otherwise.
 */
export const isNullish = (value: unknown): value is null | undefined => {
  return value === undefined || value === null;
};

/**
 * Determines whether the given value is not `null` or `undefined`.
 *
 * @param value Value to check.
 * @returns Returns `true` when the value is not nullish, `false` otherwise.
 */
export const isNotNullish = <T>(value: T): value is Exclude<T, null | undefined> => {
  return value !== undefined && value !== null;
};
