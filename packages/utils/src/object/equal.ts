import type { AnyObject, PartialProperties } from './generics.js';
import type { ObjectOptions } from './options.js';

import { deepEqualArray } from '../array/equal.js';
import { isAnyObject } from './any.js';

/**
 * Check whether `target` and `source` objects are equal ignoring any property
 * given in the`exclude` object.
 *
 * @param target Target object.
 * @param source Source object.
 * @param options Comparison options.
 * @returns Returns `true` when `target` and `source` are equal, `false` otherwise.
 */
export const deepEqualObject = <T extends AnyObject, S extends AnyObject>(
  target: T,
  source: S,
  options?: ObjectOptions<T & S>
) => {
  const allKeys = [...new Set([...Object.keys(target), ...Object.keys(source)])];

  const exclude = options?.exclude ?? ({} as PartialProperties<T & S>);

  const depth = options?.depth ?? +Infinity;

  for (const key of allKeys) {
    const keyState = exclude[key];

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

    if (depth > 0 && isAnyObject(targetValue) && isAnyObject(sourceValue)) {
      const isEqual = deepEqualObject(targetValue, sourceValue, {
        exclude: keyState as PartialProperties<T & S>,
        depth: depth - 1
      });

      if (!isEqual) {
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
