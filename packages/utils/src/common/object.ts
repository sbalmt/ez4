import type { AnyObject, PartialProperties } from '../object/generics.js';

import { ArrayComparison, deepCompareArray } from '../array/compare.js';
import { deepCompareObject, ObjectComparison } from '../object/compare.js';
import { deepEqualObject } from '../object/equal.js';
import { deepEqualArray } from '../array/equal.js';
import { isAnyObject } from '../object/any.js';

type Exclude<T extends AnyObject | unknown[]> = PartialProperties<T extends any[] ? never : T>;

type Return<T extends AnyObject | unknown[]> = T extends any[] ? ArrayComparison : ObjectComparison;

/**
 * Deep compare `target` and `source` and returns the differences between them.
 * When `target` and `source` are objects, use the `exclude` object to optionally
 * specify properties to not compare.
 *
 * @param target Target object or array.
 * @param source Source object or array.
 * @param exclude Set of `target` and `source` properties to not compare.
 * @returns Returns the difference object between `target` and `source`.
 */
export const deepCompare = <T extends AnyObject | unknown[], S extends AnyObject | unknown[]>(
  target: T,
  source: S,
  exclude?: Exclude<T & S>
): Return<T & S> => {
  if (Array.isArray(target) && Array.isArray(source)) {
    return deepCompareArray(target, source);
  }

  if (isAnyObject(target) && isAnyObject(source)) {
    return deepCompareObject<T, S>(target, source, exclude);
  }

  throw new TypeError(`Unsupported target and/or source parameter.`);
};

/**
 * Check whether `target` and `source` are equal. When `target` and `source` are objects,
 * use the `exclude` object to optionally specify properties to not compare.
 *
 * @param target Target object or array.
 * @param source Source object or array.
 * @param exclude Set of `target` and `source` properties to not compare.
 * @returns Returns `true` when `target` and `source` are equal, `false` otherwise.
 */
export const deepEqual = <T extends AnyObject | unknown[], S extends AnyObject | unknown[]>(
  target: T,
  source: S,
  exclude?: Exclude<T & S>
) => {
  if (Array.isArray(target) && Array.isArray(source)) {
    return deepEqualArray(target, source);
  }

  if (isAnyObject(target) && isAnyObject(source)) {
    return deepEqualObject(target, source, exclude);
  }

  throw false;
};
