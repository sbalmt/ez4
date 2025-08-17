import { toSnakeCase } from '@ez4/utils';

export const getPrimaryKeyName = (table: string, name: string) => {
  return `${getName(table, name)}_pk`;
};

export const getUniqueKeyName = (table: string, name: string) => {
  return `${getName(table, name)}_uk`;
};

export const getSecondaryKeyName = (table: string, name: string) => {
  return `${getName(table, name)}_sk`;
};

export const getRelationName = (table: string, name: string) => {
  return `${getName(table, name)}_fk`;
};

const getName = (table: string, name: string) => {
  return `${table}_${toSnakeCase(name.replaceAll(':', '_'))}`;
};
