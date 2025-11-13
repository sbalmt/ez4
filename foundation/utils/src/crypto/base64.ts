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
