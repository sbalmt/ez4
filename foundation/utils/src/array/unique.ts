/**
 * Given an input array, it returns a new array containing only unique elements.
 *
 * @param array Input array.
 * @returns Returns a new array containing only unique elements.
 */
export const uniqueArray = <T>(array: T[]) => {
  return [...new Set(array)];
};
