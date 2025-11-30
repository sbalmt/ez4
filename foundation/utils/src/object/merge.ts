import type { AnyObject, IsObject, PartialObject, PartialProperties, Prettify } from './generics';

import { arrayUnique } from '../array/unique';
import { isAnyObject, isPlainObject } from './check';

/**
 * Deep merge options.
 */
export type MergeOptions<T extends AnyObject> = {
  /**
   * After the given depth level, all objects and arrays are not deeply merged.
   * Default is: `+Infinite`
   */
  depth?: number;

  /**
   * Determines whether or not to combine arrays.
   * Default is: `false`
   */
  array?: boolean;

  /**
   * Determines whether replace existing properties in target.
   * Default is: `true`
   */
  replace?: boolean;

  /**
   * Determines which property must be excluded, all other properties are included.
   */
  exclude?: PartialProperties<T>;

  /**
   * Determines which property must be included, all other properties are excluded.
   */
  include?: PartialProperties<T>;
};

/**
 * Given the `deepMerge` inferred types, it produces a new type matching the deep merge result type.
 */
export type MergeResult<T extends AnyObject, O extends MergeOptions<T>> = Prettify<
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
 * Merge into the `target` object the given `source` object and generate a new one according to the
 * given options.
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
    throw new TypeError(`Can't specify include and exclude at the same time for merge options.`);
  }

  const isInclude = !!includeStates;
  const allStates = includeStates ?? excludeStates ?? ({} as PartialProperties<T & S>);

  const allKeys = new Set([...Object.keys(target), ...Object.keys(source)]);

  const depth = options?.depth ?? +Infinity;
  const replace = options?.replace ?? true;
  const array = options?.array ?? false;

  const object: AnyObject = {};

  for (const key of allKeys) {
    const keyState = allStates[key] as PartialProperties<T & S> | boolean;

    if ((isInclude && !keyState) || (!isInclude && keyState === true)) {
      continue;
    }

    const targetValue = target[key];
    const sourceValue = source[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      if (depth > 0) {
        object[key] = deepMerge(targetValue, sourceValue, {
          ...(isAnyObject(keyState) && (isInclude ? { include: keyState } : { exclude: keyState })),
          depth: depth - 1,
          replace,
          array
        });

        continue;
      }

      object[key] = {
        ...sourceValue,
        ...targetValue
      };

      continue;
    }

    if (targetValue !== undefined && !replace) {
      object[key] = targetValue;
      continue;
    }

    if (array && Array.isArray(sourceValue) && Array.isArray(targetValue)) {
      object[key] = arrayUnique(...sourceValue, ...targetValue);
      continue;
    }

    const value = sourceValue ?? targetValue;

    if (value !== undefined) {
      object[key] = value;
    }
  }

  return object as MergeResult<T & S, O>;
};
