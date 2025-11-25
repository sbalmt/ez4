import type { AnyObject, Complete } from './generics';

import { isNullish } from '../browser';

/**
 * Check whether the given object has defined and non-nullish the given properties.
 * If no properties are given, all object properties are checked.
 *
 * @param object Object to check.
 * @param properties Optional properties.
 * @returns Returns `true` when the given object is fulfilled, `false` otherwise.
 */
export const isNotNullishObject = <T extends AnyObject, P extends keyof T>(
  object: T,
  ...properties: P[]
): object is T & Complete<Pick<T, P>> => {
  if (properties.length) {
    for (const property of properties) {
      if (isNullish(object[property])) {
        return false;
      }
    }
  } else {
    for (const property in object) {
      if (isNullish(object[property])) {
        return false;
      }
    }
  }

  return true;
};
