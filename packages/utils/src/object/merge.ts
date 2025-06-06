import type { AnyObject, IsObject, PartialObject, PartialProperties } from './generics.js';

import { isAnyObject } from './check.js';

/**
 * Deep merge options.
 */
export type MergeOptions<T extends AnyObject> = {
  /**
   * After the given depth level, all objects and arrays are not deeply merged.
   */
  depth?: number;

  /**
   * Determines which property must be excluded, all other properties are included.
   */
  exclude?: PartialProperties<T>;

  /**
   * Determines which property must be included, all other properties are excluded.
   */
  include?: PartialProperties<T>;
};

export type MergeResult<T extends AnyObject, O> = O extends { exclude: infer E }
  ? IsObject<E> extends true
    ? PartialObject<T, NonNullable<E>, true>
    : unknown
  : O extends { include: infer I }
    ? IsObject<I> extends true
      ? PartialObject<T, NonNullable<I>, false>
      : unknown
    : T;

/**
 * Merge into the `target` object the given `source` object and generate a new one according to the given options.
 *
 * @param target Target object.
 * @param source Source object.
 * @param options Merging options.
 * @returns Returns the new object.
 */
export const deepMerge = <T extends AnyObject, S extends AnyObject, O extends MergeOptions<T & S>>(target: T, source: S, options?: O) => {
  const includeStates = options?.include;
  const excludeStates = options?.exclude;

  if (includeStates && excludeStates) {
    throw new TypeError(`Can't specify include and exclude for merge options together.`);
  }

  const isInclude = !!includeStates;
  const allStates = includeStates ?? excludeStates ?? ({} as PartialProperties<T & S>);

  const depth = options?.depth ?? +Infinity;

  const allKeys = [...new Set([...Object.keys(target), ...Object.keys(source)])];

  const object: AnyObject = {};

  for (const key of allKeys) {
    const keyState = allStates[key] as PartialProperties<T & S> | boolean;

    if ((isInclude && !keyState) || (!isInclude && keyState === true)) {
      continue;
    }

    const targetValue = target[key];
    const sourceValue = source[key];

    if (targetValue instanceof Function || sourceValue instanceof Function) {
      continue;
    }

    if (isAnyObject(targetValue) && isAnyObject(sourceValue)) {
      if (depth > 0) {
        object[key] = deepMerge(targetValue, sourceValue, {
          ...(isAnyObject(keyState) && (isInclude ? { include: keyState } : { exclude: keyState })),
          depth: depth - 1
        });

        continue;
      }

      object[key] = {
        ...sourceValue,
        ...targetValue
      };

      continue;
    }

    object[key] = sourceValue ?? targetValue;
  }

  return object as MergeResult<T & S, O>;
};
