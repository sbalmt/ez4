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

/**
 * Given a value it returns its corresponding based64 encoded value.
 *
 * @param value Input value.
 * @returns Returns the base64 encoded version.
 */
export const base64Encode = (value: string) => {
  return Buffer.from(value).toString('base64');
};

/**
 * Given a base64 value it returns its corresponding decoded value.
 *
 * @param value Input value.
 * @returns Return the base64 decoded version.
 */
export const base64Decode = (value: string) => {
  return Buffer.from(value, 'base64').toString();
};
