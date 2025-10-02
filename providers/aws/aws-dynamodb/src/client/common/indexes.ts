import type { AnyObject } from '@ez4/utils';

import { isEmptyObject } from '@ez4/utils';

import { getIndexName } from '../../types/indexes';

export const findBestSecondaryIndex = (indexes: string[][], fields: AnyObject) => {
  if (isEmptyObject(fields)) {
    return undefined;
  }

  const [[partitionKey], ...secondaryIndexes] = indexes;

  let currentIndexes = secondaryIndexes;
  let bestIndexes;

  for (const fieldKey in fields) {
    if (partitionKey === fieldKey) {
      return undefined;
    }

    currentIndexes = currentIndexes.filter((index) => index.includes(fieldKey));

    if (currentIndexes.length) {
      bestIndexes = currentIndexes;
    }
  }

  if (!bestIndexes) {
    return undefined;
  }

  if (bestIndexes.length > 1) {
    bestIndexes.sort((a, b) => a.length - b.length);
  }

  const firstBestIndex = bestIndexes[0];

  return getIndexName(firstBestIndex);
};
