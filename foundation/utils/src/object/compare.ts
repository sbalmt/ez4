import type { AnyObject, PartialProperties } from './generics';
import type { Decompose } from '../common/generics';

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
   * Determines whether or not the given key names are the same.
   *
   * @param target Target key name.
   * @param source Source key name.
   * @returns Returns `true` when the given keys are the same, `false` otherwise.
   */
  onSimilarName?: (target: string, source: string) => boolean;

  /**
   * Determines whether or not an object property can be renamed.
   *
   * @param target Target value.
   * @param source Source value.
   * @returns Returns `true` when the object property can be renamed, `false` otherwise.
   */
  onRename?: (target: Decompose<T>, source: Decompose<S>) => boolean;
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

  const depth = options?.depth ?? +Infinity;

  const onSimilarName = options?.onSimilarName;
  const onRename = options?.onRename;

  const toCreateKeys = [];
  const toRemoveKeys = [];

  const nested: Record<string, ObjectComparison> = {};

  const toRename: AnyObject = {};
  const toCreate: AnyObject = {};
  const toUpdate: AnyObject = {};
  const toRemove: AnyObject = {};

  const counter = {
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

      const removeKey = getSimilarName(key, toRemoveKeys, onSimilarName);

      if (removeKey && (!onRename || onRename(targetValue, toRemove[removeKey]))) {
        delete toRemove[removeKey];
        counter.remove--;

        toRename[removeKey] = key;
        counter.rename++;

        continue;
      }

      toCreate[key] = targetValue;
      counter.create++;

      continue;
    }

    if (targetValue === undefined && sourceValue !== undefined) {
      toRemoveKeys.push(key);

      const createKey = getSimilarName(key, toCreateKeys, onSimilarName);

      if (createKey && (!onRename || onRename(toCreate[createKey], sourceValue))) {
        delete toCreate[createKey];
        counter.create--;

        toRename[key] = createKey;
        counter.rename++;

        continue;
      }

      toRemove[key] = sourceValue;
      counter.remove++;

      continue;
    }

    if (depth > 0) {
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        const changes = deepCompareArray(targetValue, sourceValue);

        if (changes.counts > 0) {
          toUpdate[key] = changes;
          counter.update++;
        }

        continue;
      }

      if (isAnyObject(targetValue) && isAnyObject(sourceValue)) {
        const changes = deepCompareObject(targetValue, sourceValue, {
          ...(isAnyObject(keyState) && (isInclude ? { include: keyState } : { exclude: keyState })),
          depth: depth - 1,
          onSimilarName,
          onRename
        });

        if (changes.counts > 0) {
          nested[key] = changes;
          counter.nested++;
        }

        continue;
      }
    }

    toUpdate[key] = targetValue;

    counter.update++;
  }

  return {
    counts: counter.create + counter.update + counter.remove + counter.rename + counter.nested,
    ...(counter.create && { create: toCreate }),
    ...(counter.update && { update: toUpdate }),
    ...(counter.remove && { remove: toRemove }),
    ...(counter.rename && { rename: toRename }),
    ...(counter.nested && { nested })
  };
};

const getSimilarName = (name: string, keys: string[], predicate?: (target: string, source: string) => boolean) => {
  const keyIndex = keys.findIndex((key) => {
    return predicate ? predicate(name, key) : key.includes(name) || name.includes(key);
  });

  if (keyIndex >= 0) {
    const [keyName] = keys.splice(keyIndex, 1);

    return keyName;
  }

  return undefined;
};
