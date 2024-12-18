import type { AnyObject } from '@ez4/utils';
import type { PartialSchemaProperties } from '@ez4/schema/library';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { getPartialSchema, SchemaType } from '@ez4/schema/library';

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
  relations: RepositoryRelationsWithSchema,
  data: AnyObject
): ObjectSchema => {
  const finalSchema = {
    ...schema,
    properties: {
      ...schema.properties
    }
  };

  for (const alias in relations) {
    const hasRelationData = alias in data;

    if (!hasRelationData) {
      continue;
    }

    const { sourceColumn, sourceSchema, targetColumn, foreign } = relations[alias]!;

    if (foreign) {
      const fieldSchema = finalSchema.properties[targetColumn];

      finalSchema.properties[alias] = {
        ...sourceSchema,
        optional: fieldSchema?.optional
      };

      delete finalSchema.properties[targetColumn];

      continue;
    }

    finalSchema.properties[alias] = {
      type: SchemaType.Array,
      optional: true,
      element: getPartialSchema(sourceSchema, {
        exclude: {
          [sourceColumn]: true
        }
      })
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
    const hasRelationData = alias in data;

    if (!hasRelationData) {
      continue;
    }

    const { targetColumn, sourceSchema } = relations[alias]!;
    const { nullable, optional } = schema.properties[targetColumn];

    finalSchema.properties[alias] = {
      ...sourceSchema,
      nullable,
      optional
    };
  }

  return getPartialSchema(finalSchema, {
    include: getDataProperties(data),
    extensible: true
  });
};

const getDataProperties = (data: AnyObject) => {
  const properties: PartialSchemaProperties = {};

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
