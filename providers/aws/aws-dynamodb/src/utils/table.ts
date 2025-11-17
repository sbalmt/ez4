import type { DatabaseTable } from '@ez4/database/library';

import { toKebabCase } from '@ez4/utils';

export const getTableName = (tablePrefix: string, table: DatabaseTable) => {
  return `${tablePrefix}-${toKebabCase(table.name)}`;
};
