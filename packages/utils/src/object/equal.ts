import type { AnyObject, PartialProperties } from './generics.js';

import { deepEqualArray } from '../array/equal.js';
import { isAnyObject } from './check.js';

/**
 * Deep equal options.
 */
export type ObjectEqualityOptions<T extends AnyObject> = {
  /**
   * After the given depth level, all objects and arrays are not deeply checked.
   */
  depth?: number;

  /**
   * Determines which property must be excluded, all other properties are included.
   */
  exclude?: PartialProperties<T>;

  /**
   * Determines which property must be included, all other properties are excluded.
   */
  include?: PartialProperties<T>;
};

/**
 * Check whether `target` and `source` objects according to the given options.
 *
 * @param target Target object.
 * @param source Source object.
 * @param options Equality options.
 * @returns Returns `true` when `target` and `source` are equal, `false` otherwise.
 */
export const deepEqualObject = <T extends AnyObject, S extends AnyObject>(target: T, source: S, options?: ObjectEqualityOptions<T & S>) => {
  const includeStates = options?.include;
  const excludeStates = options?.exclude;

  if (includeStates && excludeStates) {
    throw new TypeError(`Can't specify include and exclude equality options together.`);
  }

  const isInclude = !!includeStates;
  const allStates = includeStates ?? excludeStates ?? ({} as PartialProperties<T & S>);

  const depth = options?.depth ?? +Infinity;

  const allKeys = [...new Set([...Object.keys(target), ...Object.keys(source)])];

  for (const key of allKeys) {
    const keyState = allStates[key] as PartialProperties<T & S> | boolean;

    if ((isInclude && !keyState) || (!isInclude && keyState === true)) {
      continue;
    }

    const targetValue = target[key];
    const sourceValue = source[key];

    if (targetValue instanceof Function || sourceValue instanceof Function) {
      continue;
    }

    if (depth > 0) {
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        if (!deepEqualArray(targetValue, sourceValue)) {
          return false;
        }

        continue;
      }

      if (isAnyObject(targetValue) && isAnyObject(sourceValue)) {
        const result = deepEqualObject(targetValue, sourceValue, {
          ...(isAnyObject(keyState) && (isInclude ? { include: keyState } : { exclude: keyState })),
          depth: depth - 1
        });

        if (!result) {
          return false;
        }

        continue;
      }
    }

    if (targetValue !== sourceValue) {
      return false;
    }
  }

  return true;
};
