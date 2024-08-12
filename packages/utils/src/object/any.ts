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
