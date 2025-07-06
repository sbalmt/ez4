import { toSnakeCase } from '@ez4/utils';

export const getTableName = (table: string) => {
  return toSnakeCase(table);
};
