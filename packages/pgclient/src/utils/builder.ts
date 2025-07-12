import type { ObjectSchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

import { PgClientDriver } from '../types/driver.js';

const jsonSchema: ObjectSchema = {
  type: SchemaType.Object,
  properties: {}
};

export const createQueryBuilder = (driver: PgClientDriver) => {
  return new SqlBuilder({
    onPrepareVariable: (value, { index, schema, json }) => {
      const field = index.toString();

      if (!json) {
        return driver.prepareVariable(field, value, schema);
      }

      return driver.prepareVariable(field, value, jsonSchema);
    }
  });
};
