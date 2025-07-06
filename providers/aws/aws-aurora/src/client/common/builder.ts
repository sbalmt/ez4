import { SqlBuilder } from '@ez4/pgsql';

import { detectFieldData, prepareFieldData, getJsonFieldData } from './data.js';

export const createQueryBuilder = () => {
  return new SqlBuilder({
    onPrepareVariable: (value, { index, schema, json }) => {
      const field = index.toString();

      if (json) {
        return getJsonFieldData(field, value);
      }

      if (schema) {
        return prepareFieldData(field, value, schema);
      }

      return detectFieldData(field, value);
    }
  });
};
