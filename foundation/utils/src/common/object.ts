import type { ObjectCompareOptions, ObjectComparison } from '../object/compare';
import type { ObjectEqualityOptions } from '../object/equal';
import type { ArrayComparison } from '../array/compare';
import type { AnyObject } from '../object/generics';
import type { IsArray } from '../array/generics';

import { deepEqualArray } from '../array/equal';
import { deepCompareArray } from '../array/compare';
import { isAnyObject, isPlainObject } from '../object/check';
import { deepCompareObject } from '../object/compare';
import { deepEqualObject } from '../object/equal';

export type CompareOptions<T extends AnyObject | unknown[], S extends AnyObject | unknown[]> =
  IsArray<T> extends true ? never : ObjectCompareOptions<T, S>;

export type CompareResult<T extends AnyObject | unknown[]> = IsArray<T> extends true ? ArrayComparison : ObjectComparison;

/**
 * Deep compare `target` and `source` and returns the differences between them.
 *
 * @param target Target object or array.
 * @param source Source object or array.
 * @param options Comparison options.
 * @returns Returns the difference object between `target` and `source`.
 */
export const deepCompare = <T extends AnyObject | unknown[], S extends AnyObject | unknown[]>(
  target: T,
  source: S,
  options?: CompareOptions<T, S>
): CompareResult<T & S> => {
  if (Array.isArray(target) && Array.isArray(source)) {
    return deepCompareArray(target, source);
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    return deepCompareObject<T, S>(target, source, options);
  }

  throw new TypeError(`Both source and target must be either objects or arrays.`);
};

export type EqualityOptions<T extends AnyObject | unknown[]> = IsArray<T> extends true ? never : ObjectEqualityOptions<T>;

/**
 * Check whether `target` and `source` are equal.
 *
 * @param target Target object or array.
 * @param source Source object or array.
 * @param options Equality options.
 * @returns Returns `true` when `target` and `source` are equal, `false` otherwise.
 */
export const deepEqual = <T extends AnyObject | unknown[], S extends AnyObject | unknown[]>(
  target: T,
  source: S,
  options?: EqualityOptions<T & S>
) => {
  if (Array.isArray(target) && Array.isArray(source)) {
    return deepEqualArray(target, source);
  }

  if (isAnyObject(target) && isAnyObject(source)) {
    return deepEqualObject(target, source, options);
  }

  throw false;
};
