import type { AnyObject } from './generics';

import { isAnyArray } from '../array/check';
import { isPlainObject } from './check';

/**
 * Deep check whether the given object is empty or not.
 * It always return `false` for array objects.
 *
 * @param object Object to check.
 * @returns Returns `true` for an empty object, `false` otherwise.
 */
export const isEmptyObject = (object: AnyObject) => {
  if (isAnyArray(object)) {
    return false;
  }

  for (const key in object) {
    if (!Object.hasOwn(object, key)) {
      continue;
    }

    const value = object[key];

    if (value !== undefined && (!isPlainObject(value) || !isEmptyObject(value))) {
      return false;
    }
  }

  return true;
};
