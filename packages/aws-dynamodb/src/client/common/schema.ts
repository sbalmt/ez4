import type { PartialObjectSchemaProperties } from '@ez4/schema/library';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { partialObjectSchema } from '@ez4/schema/library';

export const preparePartialSchema = (schema: ObjectSchema, data: AnyObject) => {
  return partialObjectSchema(schema, getPartialProperties(data));
};

const getPartialProperties = (data: AnyObject) => {
  const properties: PartialObjectSchemaProperties = {};

  for (const propertyName in data) {
    const value = data[propertyName];

    if (value instanceof Object) {
      properties[propertyName] = getPartialProperties(value);
    } else {
      properties[propertyName] = value;
    }
  }

  return properties;
};
