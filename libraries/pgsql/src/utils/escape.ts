import { UnsupportedSqlDataError } from '../errors/data';

export const escapeSqlNames = (names: string[]) => {
  return names.map((name) => escapeSqlName(name)).join(', ');
};

export const escapeSqlName = (name: string) => {
  return name === '*' ? name : `"${name.replaceAll('"', '')}"`;
};

export const escapeSqlText = (text: string) => {
  return `'${text.replaceAll(/'/g, `''`)}'`;
};

export const escapeSqlData = (data: unknown) => {
  switch (typeof data) {
    case 'number':
    case 'boolean':
      return data;

    case 'string':
      return escapeSqlText(data);

    case 'object':
      return escapeSqlText(JSON.stringify(data));

    default:
      throw new UnsupportedSqlDataError();
  }
};
