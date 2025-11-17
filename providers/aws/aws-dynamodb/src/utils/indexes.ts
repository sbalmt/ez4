import type { TableIndex } from '@ez4/database/library';

import { Index } from '@ez4/database';

export const getTableIndexes = (tableIndexes: TableIndex[]): string[][] => {
  const indexes = [];

  for (const { columns, type } of tableIndexes) {
    if (type === Index.Primary) {
      indexes.unshift(columns);
    } else if (type === Index.Secondary) {
      indexes.push(columns);
    }
  }

  return indexes;
};
