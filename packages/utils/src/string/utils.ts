/**
 * Determines whether or not the given value is a valid string.
 *
 * @param value Value to check.
 * @returns Returns `true` for a valid string, `false` otherwise.
 */
export const isAnyString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * Capitalize the given string.
 *
 * @param string String to capitalize.
 * @returns Returns the capitalized string.
 */
export const capitalizeString = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

/**
 * Join all the given pieces into a single string omitting `null` and `undefined` pieces.
 *
 * @param separator String separator.
 * @param pieces String pieces.
 * @returns Returns a string containing all the given pieces.
 */
export const joinString = (separator: string, pieces: (number | string | undefined | null)[]) => {
  return pieces.filter((piece) => piece !== undefined && piece !== null).join(separator);
};
