import type { PartialObjectSchemaProperties } from '@ez4/schema/library';
import type { ObjectSchema } from '@ez4/schema';
import type { Database } from '@ez4/database';
import type { AnyObject } from '@ez4/utils';

import { partialObjectSchema } from '@ez4/schema/library';

import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedRequestError } from './errors.js';

export const validateSchema = async <T extends Database.Schema>(
  rawInput: T,
  schema: ObjectSchema
) => {
  const errors = await validate(rawInput, schema);

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new MalformedRequestError(messages);
  }
};

export const preparePartialSchema = (schema: ObjectSchema, data: AnyObject) => {
  return partialObjectSchema(schema, {
    include: getPartialProperties(data),
    extensible: true
  });
};

const getPartialProperties = (data: AnyObject) => {
  const properties: PartialObjectSchemaProperties = {};

  for (const propertyName in data) {
    const value = data[propertyName];

    if (value === undefined) {
      continue;
    }

    if (value instanceof Object) {
      properties[propertyName] = getPartialProperties(value);
    } else {
      properties[propertyName] = true;
    }
  }

  return properties;
};
