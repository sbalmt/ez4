import type { PartialObjectSchemaProperties } from '@ez4/schema/library';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { partialObjectSchema } from '@ez4/schema/library';

export const preparePartialSchema = (schema: ObjectSchema, data: AnyObject) => {
  return partialObjectSchema(schema, {
    include: getDataProperties(data),
    extensible: true
  });
};

const getDataProperties = (data: AnyObject) => {
  const properties: PartialObjectSchemaProperties = {};

  for (const propertyName in data) {
    const value = data[propertyName];

    if (value === undefined) {
      continue;
    }

    if (value instanceof Object) {
      properties[propertyName] = getDataProperties(value);
    } else {
      properties[propertyName] = true;
    }
  }

  return properties;
};
