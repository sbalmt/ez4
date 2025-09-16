import type { ObjectSchema } from '@ez4/schema';

import { isAnyObject } from '@ez4/utils';
import { SchemaType } from '@ez4/schema';

export const isSingleRelationData = (value: unknown) => {
  return isAnyObject(value);
};

export const isMultipleRelationData = (value: unknown) => {
  return Array.isArray(value);
};

export const isRelationalData = (value: unknown): boolean => {
  return isSingleRelationData(value) || isMultipleRelationData(value);
};

export const getTargetCreationSchema = (schema: ObjectSchema, sourceColumn: string) => {
  const sourceProperties = {
    ...schema.properties
  };

  delete sourceProperties[sourceColumn];

  return {
    type: SchemaType.Object,
    properties: sourceProperties
  };
};

export const getSourceCreationSchema = (schema: ObjectSchema, sourceColumn: string) => {
  const sourceSchema = schema.properties[sourceColumn];

  if (!sourceSchema.nullable && !sourceSchema.optional) {
    return schema;
  }

  return {
    type: SchemaType.Object,
    properties: {
      ...schema.properties,
      [sourceColumn]: {
        ...sourceSchema,
        nullable: false,
        optional: false
      }
    }
  };
};

export const getConnectionSchema = (schema: ObjectSchema, columnName: string): ObjectSchema => {
  return {
    type: SchemaType.Object,
    properties: {
      [columnName]: {
        ...schema.properties[columnName],
        nullable: true,
        optional: true
      }
    }
  };
};
