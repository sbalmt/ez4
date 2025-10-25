/**
 * Determines whether the given value is `null` or `undefined`.
 * @param value Value to check.
 * @returns Returns `true` when the object is nullish, `false` otherwise.
 */
export const isNullish = (value: unknown) => {
  return value === undefined || value === null;
};
