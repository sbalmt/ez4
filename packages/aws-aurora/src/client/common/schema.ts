import type { AnyObject } from '@ez4/utils';
import type { PartialSchemaProperties } from '@ez4/schema/library';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isAnyObject } from '@ez4/utils';
import { getUniqueErrorMessages } from '@ez4/validator';
import { getPartialSchema, SchemaType } from '@ez4/schema/library';
import { validate } from '@ez4/validator';
import { Index } from '@ez4/database';

import { MalformedRequestError, MissingRelationDataError } from './errors.js';
import { isSkippableData } from './data.js';

export const validateSchema = async (data: AnyObject, schema: ObjectSchema) => {
  const errors = await validate(data, schema);

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new MalformedRequestError(messages);
  }
};

export const getInsertSchema = (
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  data: AnyObject
): ObjectSchema => {
  const finalSchema = getNewSchema(schema);

  for (const alias in relations) {
    const relationData = relations[alias];
    const fieldValue = data[alias];

    if (!relationData) {
      throw new MissingRelationDataError(alias);
    }

    if (!isAnyObject(fieldValue)) {
      continue;
    }

    const { sourceColumn, sourceSchema, sourceIndex, targetColumn } = relationData;

    if (!sourceIndex || sourceIndex === Index.Secondary) {
      finalSchema.properties[alias] = {
        type: SchemaType.Array,
        element: getPartialSchema(sourceSchema, {
          exclude: {
            [sourceColumn]: true
          }
        })
      };

      continue;
    }

    if (sourceIndex === Index.Unique) {
      const fieldSchema = finalSchema.properties[sourceColumn];

      delete finalSchema.properties[sourceColumn];

      if (fieldValue[sourceColumn]) {
        finalSchema.properties[alias] = {
          type: SchemaType.Object,
          properties: {
            [sourceColumn]: fieldSchema
          }
        };

        continue;
      }

      finalSchema.properties[alias] = getPartialSchema(sourceSchema, {
        exclude: {
          [sourceColumn]: true
        }
      });

      continue;
    }

    if (sourceIndex === Index.Primary) {
      const fieldSchema = finalSchema.properties[targetColumn];

      delete finalSchema.properties[targetColumn];

      if (fieldValue[targetColumn]) {
        finalSchema.properties[alias] = {
          type: SchemaType.Object,
          properties: {
            [targetColumn]: fieldSchema
          }
        };

        continue;
      }

      finalSchema.properties[alias] = {
        ...sourceSchema
      };
    }
  }

  return finalSchema;
};

export const getUpdateSchema = (
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  data: AnyObject
) => {
  const finalSchema = getNewSchema(schema);

  for (const alias in relations) {
    const fieldValue = data[alias];

    if (!isAnyObject(fieldValue)) {
      continue;
    }

    const { targetColumn, sourceSchema, targetIndex } = relations[alias]!;

    const fieldSchema = finalSchema.properties[targetColumn];
    const isForeign = targetIndex !== Index.Primary;

    delete finalSchema.properties[targetColumn];

    finalSchema.properties[alias] = getNewSchema(sourceSchema, {
      nullable: finalSchema.nullable,
      optional: finalSchema.optional,
      properties: {
        ...(isForeign && {
          [targetColumn]: fieldSchema
        })
      }
    });
  }

  return getPartialSchema(finalSchema, {
    include: getDataProperties(data),
    extensible: true
  });
};

const getDataProperties = (data: AnyObject) => {
  const properties: PartialSchemaProperties = {};

  for (const propertyName in data) {
    const fieldValue = data[propertyName];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    if (isAnyObject(fieldValue)) {
      properties[propertyName] = getDataProperties(fieldValue);
    } else {
      properties[propertyName] = true;
    }
  }

  return properties;
};

const getNewSchema = (baseSchema: ObjectSchema, extraSchema?: Partial<ObjectSchema>) => {
  return {
    ...baseSchema,
    ...extraSchema,
    properties: {
      ...baseSchema.properties,
      ...extraSchema?.properties
    }
  };
};
