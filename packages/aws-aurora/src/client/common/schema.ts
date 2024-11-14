import type { AnyObject } from '@ez4/utils';
import type { PartialObjectSchemaProperties } from '@ez4/schema/library';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { partialObjectSchema, SchemaTypeName } from '@ez4/schema/library';

import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedRequestError } from './errors.js';

export const validateSchema = async (data: AnyObject, schema: ObjectSchema) => {
  const errors = await validate(data, schema);

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new MalformedRequestError(messages);
  }
};

export const prepareInsertSchema = (
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema
): ObjectSchema => {
  const finalSchema = { ...schema };

  for (const alias in relations) {
    const { targetAlias, targetColumn, sourceSchema, foreign } = relations[alias]!;
    const { nullable, optional } = schema.properties[targetColumn];

    if (foreign) {
      finalSchema.properties[targetAlias] = {
        ...sourceSchema,
        nullable,
        optional
      };

      continue;
    }

    finalSchema.properties[targetAlias] = {
      type: SchemaTypeName.Array,
      element: sourceSchema,
      nullable,
      optional
    };
  }

  return finalSchema;
};

export const prepareUpdateSchema = (
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  data: AnyObject
) => {
  const finalSchema = { ...schema };

  for (const alias in relations) {
    const { targetAlias, targetColumn, sourceSchema } = relations[alias]!;
    const { nullable, optional } = schema.properties[targetColumn];

    finalSchema.properties[targetAlias] = {
      ...sourceSchema,
      nullable,
      optional
    };
  }

  return partialObjectSchema(finalSchema, {
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
