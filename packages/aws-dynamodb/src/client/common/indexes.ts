import { isEmptyObject, type AnyObject } from '@ez4/utils';

import { getIndexName } from '../../types/indexes.js';

export const findBestSecondaryIndex = (secondaryIndexes: string[][], fields: AnyObject) => {
  if (isEmptyObject(fields)) {
    return undefined;
  }

  let bestIndexes = secondaryIndexes;

  for (const fieldKey in fields) {
    const nextIndexes = bestIndexes.filter((index) => index.includes(fieldKey));

    if (nextIndexes.length > 0) {
      bestIndexes = nextIndexes;
    }
  }

  const firstBestIndex = bestIndexes[0];

  if (firstBestIndex) {
    return getIndexName(firstBestIndex);
  }

  return undefined;
};
