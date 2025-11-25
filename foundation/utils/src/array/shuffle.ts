import { getRandomInteger } from '../number/random';

/**
 * Copy and shuffle the given array.
 *
 * @param array Input array.
 * @returns Returns the new shuffled array.
 */
export const arrayShuffle = <T>(array: T[]) => {
  const length = array.length - 1;
  const result = [...array];

  for (let sourceIndex = length - 1; sourceIndex > 0; sourceIndex--) {
    const targetIndex = getRandomInteger(0, length);

    [result[sourceIndex], result[targetIndex]] = [result[targetIndex], result[sourceIndex]];
  }

  return result;
};
