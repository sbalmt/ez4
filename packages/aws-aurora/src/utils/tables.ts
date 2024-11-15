import { toCamelCase } from '@ez4/utils';

export const getTableName = (table: string) => {
  return toCamelCase(table);
};
