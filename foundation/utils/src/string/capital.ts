/**
 * Capitalize the given string.
 *
 * @param string String to capitalize.
 * @returns Returns the capitalized string.
 */
export const capitalizeString = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
