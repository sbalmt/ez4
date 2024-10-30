import type { AnyObject, PartialProperties } from './generics.js';

import { deepEqualArray } from '../array/equal.js';
import { isAnyObject } from './any.js';

type Exclude<T extends AnyObject, S extends AnyObject> = PartialProperties<T & S>;

/**
 * Check whether `target` and `source` objects are equal ignoring any property
 * given in the`exclude` object.
 *
 * @param target Target object.
 * @param source Source object.
 * @param exclude Set of `target` and `source` properties to not compare.
 * @returns Returns `true` when `target` and `source` are equal, `false` otherwise.
 */
export const deepEqualObject = <T extends AnyObject, S extends AnyObject>(
  target: T,
  source: S,
  exclude?: Exclude<T, S>
) => {
  const allKeys = [...new Set([...Object.keys(target), ...Object.keys(source)])];

  for (const key of allKeys) {
    const keyState = exclude && exclude[key];

    const targetValue = target[key];
    const sourceValue = source[key];

    if (keyState === true || targetValue instanceof Function) {
      continue;
    }

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      if (!deepEqualArray(targetValue, sourceValue)) {
        return false;
      }

      continue;
    }

    if (isAnyObject(targetValue) && isAnyObject(sourceValue)) {
      if (!deepEqualObject(targetValue, sourceValue, keyState || undefined)) {
        return false;
      }

      continue;
    }

    if (targetValue !== sourceValue) {
      return false;
    }
  }

  return true;
};
