import type { ObjectSchema, PartialSchemaProperties } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { getPartialSchema } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { isSkippableData } from './data.js';

export const preparePartialSchema = (schema: ObjectSchema, data: AnyObject) => {
  return getPartialSchema(schema, {
    include: getDataProperties(data),
    extensible: true
  });
};

const getDataProperties = (data: AnyObject) => {
  const properties: PartialSchemaProperties = {};

  for (const propertyName in data) {
    const value = data[propertyName];

    if (isSkippableData(value)) {
      continue;
    }

    if (isAnyObject(value)) {
      properties[propertyName] = getDataProperties(value);
    } else {
      properties[propertyName] = true;
    }
  }

  return properties;
};
