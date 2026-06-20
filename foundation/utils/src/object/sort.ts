import type { AnyObject } from './generics';

/**
 * Generate a new object with all keys sorted according to the given `comparison` function.
 *
 * @param object Object to sort.
 * @param comparison Optional comparison function. If omitted, a default `sort` method is used.
 * @returns Returns a new object with all keys sorted.
 */
export const getSortedObject = (object: AnyObject, comparison?: (a: string, b: string) => number) => {
  const newer: AnyObject = {};

  for (const key of Object.keys(object).sort(comparison)) {
    newer[key] = object[key];
  }

  return newer;
};

/**
 * Sort all object keys (in-place) according to the given `comparison` function.
 *
 * @param object Object to sort.
 * @param comparison Optional comparison function. If omitted, a default `sort` method is used.
 * @returns Returns the same object with all keys sorted.
 */
export const sortObject = (object: AnyObject, comparison?: (a: string, b: string) => number) => {
  for (const key of Object.keys(object).sort(comparison)) {
    const current = object[key];

    delete object[key];

    object[key] = current;
  }

  return object;
};
