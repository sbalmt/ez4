/**
 * Check whether the given array is empty or not.
 *
 * @param array Array to check.
 * @returns Returns `true` for an empty array, `false` otherwise.
 */
export const isEmptyArray = <T>(array: T[]) => {
  for (const element of array) {
    if (element !== undefined) {
      return false;
    }
  }

  return true;
};
