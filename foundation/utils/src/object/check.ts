import type { AnyObject } from './generics';

/**
 * Check whether the given value is an object.
 * It returns `false` for array objects.
 *
 * @param value Value to check.
 * @returns Returns `true` for a given object, `false` otherwise.
 */
export const isAnyObject = (value: unknown): value is AnyObject => {
  return value !== null && typeof value === 'object' && !(value instanceof Array);
};

/**
 * Check whether the given value is a plain object.
 * It returns `false` for array objects.
 *
 * @param value Value to check.
 * @returns Returns `true` for a given plain object, `false` otherwise.
 */
export const isPlainObject = (value: unknown): value is AnyObject => {
  return isAnyObject(value) && Object.getPrototypeOf(value) === Object.prototype;
};
