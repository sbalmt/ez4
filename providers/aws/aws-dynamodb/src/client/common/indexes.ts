import type { AnyObject } from '@ez4/utils';

import { isEmptyObject } from '@ez4/utils';

import { getIndexName } from '../../types/indexes.js';

export const findBestSecondaryIndex = (secondaryIndexes: string[][], fields: AnyObject) => {
  if (isEmptyObject(fields)) {
    return undefined;
  }

  let bestIndexes = secondaryIndexes;

  for (const fieldKey in fields) {
    bestIndexes = bestIndexes.filter((index) => index.includes(fieldKey));

    if (!bestIndexes.length) {
      return undefined;
    }
  }

  const [firstBestIndex] = bestIndexes;

  return getIndexName(firstBestIndex);
};
