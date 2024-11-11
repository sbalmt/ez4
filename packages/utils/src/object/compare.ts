import type { AnyObject, PartialProperties } from './generics.js';
import type { ObjectOptions } from './options.js';

import { deepCompareArray } from '../array/compare.js';
import { isAnyObject } from './any.js';

export type ObjectComparison = {
  counts: number;
  nested?: Record<string, ObjectComparison>;
  create?: AnyObject;
  update?: AnyObject;
  remove?: AnyObject;
};

/**
 * Deep compare `target` and `source` objects ignoring any property given in the
 * `exclude` object and returns the differences between them.
 *
 * @param target Target object.
 * @param source Source object.
 * @param options Comparison options.
 * @returns Returns the difference object between `target` and `source`.
 */
export const deepCompareObject = <T extends AnyObject, S extends AnyObject>(
  target: T,
  source: S,
  options?: ObjectOptions<T & S>
): ObjectComparison => {
  const allKeys = new Set([...Object.keys(target), ...Object.keys(source)]);

  const nested: Record<string, ObjectComparison> = {};

  const create: AnyObject = {};
  const update: AnyObject = {};
  const remove: AnyObject = {};

  const counts = { create: 0, update: 0, remove: 0, nested: 0 };

  const exclude = options?.exclude ?? ({} as PartialProperties<T & S>);

  const depth = options?.depth ?? +Infinity;

  for (const key of allKeys) {
    const keyState = exclude[key];

    const targetValue = target[key];
    const sourceValue = source[key];

    if (keyState === true || targetValue === sourceValue || targetValue instanceof Function) {
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
          exclude: keyState as PartialProperties<T & S>,
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
