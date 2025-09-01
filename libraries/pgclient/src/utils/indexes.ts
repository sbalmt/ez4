import type { TableIndex } from '@ez4/database/library';
import type { AnyObject } from '@ez4/utils';

import { Index } from '@ez4/database';

export const tryExtractConflictIndex = (indexes: TableIndex[], fields: AnyObject) => {
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
