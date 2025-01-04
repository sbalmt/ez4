import type { AnyObject } from './generics.js';

/**
 * Check whether the given value is an object.
 *
 * @param value Value to check.
 * @returns Returns `true` for a given object, `false` otherwise.
 */
export const isAnyObject = (value: unknown): value is AnyObject => {
  return value !== null && typeof value === 'object';
};

/**
 * Check whether the given value is a plain object.
 *
 * @param value Value to check.
 * @returns Returns `true` for a given plain object, `false` otherwise.
 */
export const isPlainObject = (value: unknown): value is AnyObject => {
  return isAnyObject(value) && Object.getPrototypeOf(value) === Object.prototype;
};

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
