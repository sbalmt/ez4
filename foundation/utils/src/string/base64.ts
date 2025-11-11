const base64RegEx = /^[A-Z0-9+/]+={0,2}$/i;

/**
 * Determines whether or not the given value is a valid base64 format.
 *
 * @param value Value to check.
 * @returns Returns `true` for a valid base64, `false` otherwise.
 */
export const isBase64 = (value: string) => {
  return value.length % 4 === 0 && base64RegEx.test(value);
};
