import { escapeSqlName, escapeSqlText } from './escape';

export const mergeSqlPath = (column: string, path: string | undefined) => {
  return path ? `${path}[${escapeSqlText(column)}]` : escapeSqlName(column);
};

export const mergeSqlJsonPath = (column: string, path: string | undefined) => {
  return path ? `${path}->>${escapeSqlText(column)}` : escapeSqlName(column);
};

export const mergeSqlAlias = (column: string, alias: string | undefined) => {
  return alias ? `${escapeSqlName(alias)}.${column}` : column;
};
