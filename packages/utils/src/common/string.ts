/**
 * Convert the given value into kebab-case.
 *
 * @param value Value to convert.
 * @returns Returns the converted value.
 */
export const toKebabCase = (value: string) => {
  return value
    .replace(/[A-Z]+(?![a-z])|[A-Z]/g, (text, offset) => (offset ? '-' : '') + text.toLowerCase())
    .replace(/[^\w\-]/g, '');
};
