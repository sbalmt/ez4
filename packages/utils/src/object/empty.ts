import type { AnyObject } from './generics.js';

/**
 * Check whether the given object is empty.
 *
 * @param object Object to check.
 * @returns Returns `true` for an empty object, `false` otherwise.
 */
export const isEmptyObject = (object: AnyObject) => {
  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      return false;
    }
  }

  return true;
};
