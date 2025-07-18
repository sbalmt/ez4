import type { AnyObject } from '@ez4/utils';

import { isEmptyObject } from '@ez4/utils';

import { getIndexName } from '../../types/indexes.js';

export const findBestSecondaryIndex = (secondaryIndexes: string[][], fields: AnyObject) => {
  if (isEmptyObject(fields)) {
    return undefined;
  }

  let currentIndexes = secondaryIndexes;
  let bestIndexes;

  for (const fieldKey in fields) {
    currentIndexes = currentIndexes.filter((index) => index.includes(fieldKey));

    if (currentIndexes.length) {
      bestIndexes = currentIndexes;
    }
  }

  const firstBestIndex = bestIndexes?.[0];

  if (firstBestIndex) {
    return getIndexName(firstBestIndex);
  }

  return undefined;
};
