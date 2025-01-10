import { deepEqualObject } from '../object/equal.js';
import { isAnyObject } from '../object/check.js';

/**
 * Check whether `target` and `source` arrays are equal.
 *
 * @param target Target object.
 * @param source Source object.
 * @returns Returns `true` when `target` and `source` are equal, `false` otherwise.
 */
export const deepEqualArray = (target: unknown[], source: unknown[]) => {
  const length = Math.max(target.length, source.length);

  for (let index = 0; index < length; ++index) {
    const targetValue = target[index];
    const sourceValue = source[index];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      if (!deepEqualArray(targetValue, sourceValue)) {
        return false;
      }

      continue;
    }

    if (isAnyObject(targetValue) && isAnyObject(sourceValue)) {
      if (!deepEqualObject(targetValue, sourceValue)) {
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
