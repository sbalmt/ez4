import type { AnyObject, PartialProperties } from './generics.js';

import { deepCompareArray } from '../array/compare.js';
import { isAnyObject } from './check.js';

export type ObjectCompareOptions<T extends AnyObject> = {
  /**
   * After the given depth level, all objects and arrays are not deeply checked.
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

export type ObjectComparison = {
  counts: number;
  nested?: Record<string, ObjectComparison>;
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
  options?: ObjectCompareOptions<T & S>
): ObjectComparison => {
  const includeStates = options?.include;
  const excludeStates = options?.exclude;

  if (includeStates && excludeStates) {
    throw new TypeError(`Can't specify include and exclude options together.`);
  }

  const isInclude = !!includeStates;
  const allStates = includeStates ?? excludeStates ?? ({} as PartialProperties<T & S>);

  const depth = options?.depth ?? +Infinity;

  const nested: Record<string, ObjectComparison> = {};

  const create: AnyObject = {};
  const update: AnyObject = {};
  const remove: AnyObject = {};

  const counts = {
    create: 0,
    update: 0,
    remove: 0,
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
      create[key] = targetValue;
      counts.create++;
      continue;
    }

    if (targetValue === undefined && sourceValue !== undefined) {
      remove[key] = sourceValue;
      counts.remove++;
      continue;
    }

    if (depth > 0) {
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        const changes = deepCompareArray(targetValue, sourceValue);

        if (changes.counts > 0) {
          update[key] = changes;
          counts.update++;
        }

        continue;
      }

      if (isAnyObject(targetValue) && isAnyObject(sourceValue)) {
        const changes = deepCompareObject(targetValue, sourceValue, {
          ...(isAnyObject(keyState) && (isInclude ? { include: keyState } : { exclude: keyState })),
          depth: depth - 1
        });

        if (changes.counts > 0) {
          nested[key] = changes;
          counts.nested++;
        }

        continue;
      }
    }

    update[key] = targetValue;

    counts.update++;
  }

  return {
    counts: counts.create + counts.remove + counts.update + counts.nested,
    ...(counts.nested && { nested }),
    ...(counts.create && { create }),
    ...(counts.remove && { remove }),
    ...(counts.update && { update })
  };
};
