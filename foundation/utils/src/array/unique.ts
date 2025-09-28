/**
 * Given the input arrays, it combine and returns a new array containing only unique elements.
 *
 * @param arrays Input array.
 * @returns Returns a new array containing only unique elements.
 */
export const uniqueArray = <T>(...arrays: T[][]) => {
  return [...new Set(arrays.flat())];
};
