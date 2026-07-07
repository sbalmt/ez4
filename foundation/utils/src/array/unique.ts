/**
 * Given the input arrays, it combine and returns a new array containing only unique elements.
 * Any `undefined` element is discarded.
 *
 * @param arrays Input array.
 * @returns Returns a new array containing only unique elements.
 */
export const arrayUnique = <T>(...arrays: ((T | undefined)[] | undefined)[]) => {
  return [...new Set(arrays.flat())].filter((element) => element !== undefined);
};
