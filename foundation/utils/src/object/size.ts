import type { AnyObject } from './generics';

import { arraySize } from '../array/size';
import { isAnyArray } from '../array/check';
import { isAnyObject } from './check';

/**
 * Calculate the object size based on the number of all its values and sub values.
 * All the `undefined` values are not taken into account.
 *
 * @param object Object to check.
 * @returns Returns the object size.
 */
export const objectSize = (object: AnyObject) => {
  let size = 0;

  for (const key in object) {
    const value = object[key];

    if (value !== undefined) {
      size++;
    }

    if (isAnyObject(value)) {
      size += objectSize(value);
    } else if (isAnyArray(value)) {
      size += arraySize(value);
    }
  }

  return size;
};
