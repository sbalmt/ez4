import type { AnyObject } from './generics';

import { isAnyObject } from './check';

/**
 * Calculate the object size based on the number of its properties.
 *
 * @param object Object to check.
 * @returns Returns the object size.
 */
export const objectSize = (object: AnyObject) => {
  if (Array.isArray(object)) {
    return 0;
  }

  let size = 0;

  for (const key in object) {
    const value = object[key];

    if (isAnyObject(value)) {
      size += objectSize(value);
    } else {
      size++;
    }
  }

  return size;
};
