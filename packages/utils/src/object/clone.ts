import type { AnyObject, PartialProperties, PartialObject } from './generics.js';

import { isAnyObject } from './any.js';

/**
 * Create a deep clone of the given `source` object ignoring any property
 * given in the `exclude` object.
 *
 * @param source Object to clone.
 * @param exclude Set of `source` properties to not clone.
 * @returns Returns a new object.
 */
export const deepClone = <T extends AnyObject, U extends PartialProperties<T>>(
  source: T,
  exclude?: U
) => {
  let clone: AnyObject = {};

  for (const key in source) {
    const state = exclude && exclude[key];
    const value = source[key];

    if (state === true) {
      continue;
    }

    if (Array.isArray(value)) {
      clone[key] = [...value];
    } else if (isAnyObject(value)) {
      clone[key] = deepClone(value, state as any);
    } else {
      clone[key] = value;
    }
  }

  return clone as PartialObject<T, U>;
};
