import type { AnyObject } from './generics.js';

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

/**
 * Deep check whether the given object is empty or not.
 * It always return `false` for array objects.
 *
 * @param object Object to check.
 * @returns Returns `true` for an empty object, `false` otherwise.
 */
export const isEmptyObject = (object: AnyObject) => {
  if (Array.isArray(object)) {
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
