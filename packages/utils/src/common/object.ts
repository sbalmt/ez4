import type { ObjectComparison } from '../object/compare.js';
import type { ObjectOptions } from '../object/options.js';
import type { AnyObject } from '../object/generics.js';
import type { IsArray } from '../array/generics.js';

import { ArrayComparison, deepCompareArray } from '../array/compare.js';
import { deepCompareObject } from '../object/compare.js';
import { deepEqualObject } from '../object/equal.js';
import { deepEqualArray } from '../array/equal.js';
import { isAnyObject } from '../object/any.js';

type Options<T extends AnyObject | unknown[]> = IsArray<T> extends true ? never : ObjectOptions<T>;

type Return<T extends AnyObject | unknown[]> =
  IsArray<T> extends true ? ArrayComparison : ObjectComparison;

/**
 * Deep compare `target` and `source` and returns the differences between them.
 * When `target` and `source` are objects, use the `exclude` object to optionally
 * specify properties to not compare.
 *
 * @param target Target object or array.
 * @param source Source object or array.
 * @param options Comparison options.
 * @returns Returns the difference object between `target` and `source`.
 */
export const deepCompare = <T extends AnyObject | unknown[], S extends AnyObject | unknown[]>(
  target: T,
  source: S,
  options?: Options<T & S>
): Return<T & S> => {
  if (Array.isArray(target) && Array.isArray(source)) {
    return deepCompareArray(target, source);
  }

  if (isAnyObject(target) && isAnyObject(source)) {
    return deepCompareObject<T, S>(target, source, options);
  }

  throw new TypeError(`Unsupported target and/or source parameter.`);
};

/**
 * Check whether `target` and `source` are equal. When `target` and `source` are objects,
 * use the `exclude` object to optionally specify properties to not compare.
 *
 * @param target Target object or array.
 * @param source Source object or array.
 * @param options Comparison options.
 * @returns Returns `true` when `target` and `source` are equal, `false` otherwise.
 */
export const deepEqual = <T extends AnyObject | unknown[], S extends AnyObject | unknown[]>(
  target: T,
  source: S,
  options?: ObjectOptions<T & S>
) => {
  if (Array.isArray(target) && Array.isArray(source)) {
    return deepEqualArray(target, source);
  }

  if (isAnyObject(target) && isAnyObject(source)) {
    return deepEqualObject(target, source, options);
  }

  throw false;
};
