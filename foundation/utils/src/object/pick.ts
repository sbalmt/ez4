import type { AnyObject } from './generics';

/**
 * Create a shallow copy of the given `object` using only the given `properties`.
 *
 * @param object Object to copy.
 * @param properties Properties to pick.
 * @returns Returns the object copy.
 */
export const pickObject = <T extends AnyObject, P extends keyof T>(object: T, properties: P[]): Pick<T, P> => {
  const copy = {} as Pick<T, P>;

  for (const property of properties) {
    copy[property] = object[property];
  }

  return copy;
};
