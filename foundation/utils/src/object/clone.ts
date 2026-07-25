import type { AnyObject, PartialProperties, PartialObject, IsObject, Prettify } from './generics';

import { isAnyObject, isPlainObject } from './check';
import { isAnyArray } from '../array/check';

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

/**
 * Given the `deepClone` inferred types, it produces a new type matching the deep clone result type.
 */
export type CloneResult<T extends AnyObject, O> = Prettify<
  O extends { exclude: infer E }
    ? IsObject<E> extends true
      ? PartialObject<T, NonNullable<E>, false>
      : unknown
    : O extends { include: infer I }
      ? IsObject<I> extends true
        ? PartialObject<T, NonNullable<I>>
        : unknown
      : T
>;

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
    throw new TypeError(`Can't specify include and exclude for clone options together.`);
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
      if (isPlainObject(value)) {
        const nestedOptions = isAnyObject(keyState) && (isInclude ? { include: keyState } : { exclude: keyState });
        clone[key] = deepClone(value, { ...nestedOptions, depth: depth - 1 });
        continue;
      }

      if (isAnyArray(value)) {
        if (isAnyObject(keyState)) {
          const nestedOptions = isAnyObject(keyState) && (isInclude ? { include: keyState } : { exclude: keyState });
          clone[key] = value.map((current: AnyObject) => deepClone(current, { ...nestedOptions, depth: depth - 1 }));
          continue;
        }

        clone[key] = [...value];
        continue;
      }
    }

    clone[key] = value;
  }

  return clone as CloneResult<T, O>;
};
