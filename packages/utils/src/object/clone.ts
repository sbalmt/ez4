import type { AnyObject, PartialProperties, PartialObject, IsObject } from './generics.js';

import { isAnyObject } from './check.js';

export type CloneOptions<T extends AnyObject, U extends PartialProperties<T>> = {
  /**
   * After the given depth level, all objects and arrays are referenced.
   */
  depth?: number;

  /**
   * Determines which property must be excluded, all other properties are included.
   */
  exclude?: U;

  /**
   * Determines which property must be included, all other properties are excluded.
   */
  include?: U;
};

export type CloneResult<T extends AnyObject, O> = O extends { exclude: infer E }
  ? IsObject<E> extends true
    ? PartialObject<T, NonNullable<E>, true>
    : unknown
  : O extends { include: infer I }
    ? IsObject<I> extends true
      ? PartialObject<T, NonNullable<I>, false>
      : unknown
    : T;

/**
 * Create a deep clone of the given `source` according to the given options.
 *
 * @param source Object to clone.
 * @param options Clone options.
 * @returns Returns the clone object.
 */
export const deepClone = <T extends AnyObject, U extends PartialProperties<T>, O extends CloneOptions<T, U>>(source: T, options?: O) => {
  const clone: AnyObject = {};

  const includeStates = (options as AnyObject)?.include;
  const excludeStates = (options as AnyObject)?.exclude;

  if (includeStates && excludeStates) {
    throw new TypeError(`Can't specify include and exclude options together.`);
  }

  const isInclude = !!includeStates;
  const allStates = includeStates ?? excludeStates ?? {};

  const depth = options?.depth ?? +Infinity;

  for (const key in source) {
    const keyState = allStates[key];

    if ((isInclude && !keyState) || (!isInclude && keyState === true)) {
      continue;
    }

    const value = source[key];

    if (depth > 0) {
      if (Array.isArray(value)) {
        clone[key] = [...value];

        continue;
      }

      if (isAnyObject(value)) {
        clone[key] = deepClone(value, {
          ...(isAnyObject(keyState) && (isInclude ? { include: keyState } : { exclude: keyState })),
          depth: depth - 1
        });

        continue;
      }
    }

    clone[key] = value;
  }

  return clone as CloneResult<T, O>;
};
