import type { AnyObject } from './generics';

import { arraySize } from '../array/size';
import { isAnyArray } from '../array/check';
import { isAnyObject } from './check';

/**
 * Calculate the object size based on the number of all its values and sub values.
 *
 * @param object Object to check.
 * @returns Returns the object size.
 */
export const objectSize = (object: AnyObject) => {
  let size = 0;

  for (const key in object) {
    const value = object[key];

    if (isAnyObject(value)) {
      size += objectSize(value);
    } else if (isAnyArray(value)) {
      size += arraySize(value);
    }

    size++;
  }

  return size;
};
