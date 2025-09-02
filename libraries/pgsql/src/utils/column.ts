import type { SqlRecord } from '../common/types';

export const getFields = (record: SqlRecord) => {
  const values = [];

  for (const column in record) {
    if (record[column] !== undefined) {
      values.push(column);
    }
  }

  return values;
};

export const getValues = (record: SqlRecord) => {
  const values = [];

  for (const column in record) {
    if (record[column] !== undefined) {
      values.push(record[column]);
    }
  }

  return values;
};
