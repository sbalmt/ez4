import type { AnyObject, InnerTypes, PartialProperties } from './generics';

import { deepCompareArray } from '../array/compare';
import { isAnyObject } from './check';

export type ObjectCompareOptions<T extends AnyObject, S extends AnyObject> = {
  /**
   * After the given depth level, all objects and arrays are not deeply checked.
   */
  depth?: number;

  /**
   * Determines which property must be excluded, all other properties are included.
   */
  exclude?: PartialProperties<T & S>;

  /**
   * Determines which property must be included, all other properties are excluded.
   */
  include?: PartialProperties<T & S>;

  /**
   * Determines whether or not an object property can be renamed.
   *
   * @param target Target value.
   * @param source Source value.
   * @returns Returns `true` when the object property can be renamed, `false` otherwise.
   */
  onRename?: (target: InnerTypes<T>, source: InnerTypes<S>) => boolean;
};

export type ObjectComparison = {
  counts: number;
  nested?: Record<string, ObjectComparison>;
  rename?: Record<string, string>;
  create?: AnyObject;
  update?: AnyObject;
  remove?: AnyObject;
};

/**
 * Deep compare `target` and `source` objects according to the given options.
 *
 * @param target Target object.
 * @param source Source object.
 * @param options Comparison options.
 * @returns Returns the difference object between `target` and `source`.
 */
export const deepCompareObject = <T extends AnyObject, S extends AnyObject>(
  target: T,
  source: S,
  options?: ObjectCompareOptions<T, S>
): ObjectComparison => {
  const includeStates = options?.include;
  const excludeStates = options?.exclude;

  if (includeStates && excludeStates) {
    throw new TypeError(`Can't specify include and exclude for compare options together.`);
  }

  const isInclude = !!includeStates;
  const allStates = includeStates ?? excludeStates ?? ({} as PartialProperties<T & S>);

  const onRename = options?.onRename;

  const depth = options?.depth ?? +Infinity;

  const nested: Record<string, ObjectComparison> = {};

  const toCreateKeys = [];
  const toRemoveKeys = [];

  const toRename: AnyObject = {};
  const toCreate: AnyObject = {};
  const toUpdate: AnyObject = {};
  const toRemove: AnyObject = {};

  const counts = {
    create: 0,
    update: 0,
    remove: 0,
    rename: 0,
    nested: 0
  };

  const allKeys = new Set([...Object.keys(target), ...Object.keys(source)]);

  for (const key of allKeys) {
    const keyState = allStates[key] as PartialProperties<T & S> | boolean;

    if ((isInclude && !keyState) || (!isInclude && keyState === true)) {
      continue;
    }

    const targetValue = target[key];
    const sourceValue = source[key];

    if (targetValue === sourceValue || targetValue instanceof Function) {
      continue;
    }

    if (targetValue !== undefined && sourceValue === undefined) {
      toCreateKeys.push(key);

      const removeKey = getSimilarKeyName(key, toRemoveKeys);

      if (removeKey && (!onRename || onRename(targetValue, toRemove[removeKey]))) {
        delete toRemove[removeKey];
        counts.remove--;

        toRename[removeKey] = key;
        counts.rename++;

        continue;
      }

      toCreate[key] = targetValue;
      counts.create++;

      continue;
    }

    if (targetValue === undefined && sourceValue !== undefined) {
      toRemoveKeys.push(key);

      const createKey = getSimilarKeyName(key, toCreateKeys);

      if (createKey && (!onRename || onRename(toCreate[createKey], sourceValue))) {
        delete toCreate[createKey];
        counts.create--;

        toRename[key] = createKey;
        counts.rename++;

        continue;
      }

      toRemove[key] = sourceValue;
      counts.remove++;

      continue;
    }

    if (depth > 0) {
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        const changes = deepCompareArray(targetValue, sourceValue);

        if (changes.counts > 0) {
          toUpdate[key] = changes;
          counts.update++;
        }

        continue;
      }

      if (isAnyObject(targetValue) && isAnyObject(sourceValue)) {
        const changes = deepCompareObject(targetValue, sourceValue, {
          ...(isAnyObject(keyState) && (isInclude ? { include: keyState } : { exclude: keyState })),
          depth: depth - 1,
          onRename
        });

        if (changes.counts > 0) {
          nested[key] = changes;
          counts.nested++;
        }

        continue;
      }
    }

    toUpdate[key] = targetValue;

    counts.update++;
  }

  return {
    counts: counts.create + counts.update + counts.remove + counts.rename + counts.nested,
    ...(counts.create && { create: toCreate }),
    ...(counts.update && { update: toUpdate }),
    ...(counts.remove && { remove: toRemove }),
    ...(counts.rename && { rename: toRename }),
    ...(counts.nested && { nested })
  };
};

/**
 * Find a similar key `name` from the given `keys` list.
 *
 * @param name Key name
 * @param keys Keys list.
 *
 * @returns Returns the similar key name or undefined.
 */
const getSimilarKeyName = (name: string, keys: string[]) => {
  return keys.find((key) => key.includes(name) || name.includes(key));
};
