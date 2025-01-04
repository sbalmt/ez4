import { deepCompareObject } from '../object/compare.js';
import { isAnyObject } from '../object/check.js';

export type ArrayComparisonResult = Record<number, any>;

export type ArrayComparison = {
  counts: number;
  create?: ArrayComparisonResult;
  update?: ArrayComparisonResult;
  remove?: ArrayComparisonResult;
};

/**
 * Deep compare `target` and `source` arrays and returns the differences between them.
 *
 * @param target Target array.
 * @param source Source array.
 * @returns Returns the difference object between `target` and `source`.
 */
export const deepCompareArray = (target: unknown[], source: unknown[]): ArrayComparison => {
  const length = Math.max(target.length, source.length);

  const create: ArrayComparisonResult = {};
  const update: ArrayComparisonResult = {};
  const remove: ArrayComparisonResult = {};

  const counts = { create: 0, update: 0, remove: 0 };

  for (let index = 0; index < length; ++index) {
    const targetValue = target[index];
    const sourceValue = source[index];

    if (targetValue === sourceValue) {
      continue;
    }

    if (targetValue !== undefined && sourceValue === undefined) {
      create[index] = targetValue;
      counts.create++;
      continue;
    }

    if (targetValue === undefined && sourceValue !== undefined) {
      remove[index] = sourceValue;
      counts.remove++;
      continue;
    }

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      const changes = deepCompareArray(targetValue, sourceValue);

      if (changes.counts > 0) {
        update[index] = changes;
        counts.update++;
      }

      continue;
    }

    if (isAnyObject(targetValue) && isAnyObject(sourceValue)) {
      const changes = deepCompareObject(targetValue, sourceValue);

      if (changes.counts) {
        update[index] = changes;
        counts.update++;
      }

      continue;
    }

    update[index] = targetValue;
    counts.update++;
  }

  return {
    counts: counts.create + counts.remove + counts.update,
    ...(counts.create && { create }),
    ...(counts.remove && { remove }),
    ...(counts.update && { update })
  };
};
