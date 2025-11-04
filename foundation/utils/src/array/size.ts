import { objectSize } from '../browser';
import { isAnyObject } from '../object/check';
import { isAnyArray } from './check';

/**
 * Calculate the array size based on the number of all its elements and sub elements.
 *
 * @param array Array to check.
 * @returns Returns the array size.
 */
export const arraySize = (array: unknown[]) => {
  let size = 0;

  for (const value of array) {
    if (isAnyObject(value)) {
      size += objectSize(value);
    } else if (isAnyArray(value)) {
      size += arraySize(value);
    }

    size++;
  }

  return size;
};
