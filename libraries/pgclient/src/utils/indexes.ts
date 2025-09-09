import type { TableIndex } from '@ez4/database/library';
import type { AnyObject } from '@ez4/utils';
import type { PgIndexRepository } from '../types/repository';

import { Index } from '@ez4/database';

export const getPrimaryIndex = (indexes: PgIndexRepository) => {
  for (const indexName in indexes) {
    const currentIndex = indexes[indexName];

    if (currentIndex.type === Index.Primary) {
      return currentIndex.columns;
    }
  }

  return undefined;
};

export const tryExtractUniqueIndex = (indexes: TableIndex[], fields: AnyObject) => {
  const allFields = Object.keys(fields);

  for (const index of indexes) {
    if (index.type !== Index.Primary && index.type !== Index.Unique) {
      continue;
    }

    const bestFit = index.columns.every((column) => allFields.includes(column));

    if (bestFit) {
      return index;
    }
  }

  return undefined;
};
