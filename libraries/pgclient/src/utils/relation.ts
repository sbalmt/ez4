import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { PgRelationWithSchema } from '../types/repository';

import { deepClone, isAnyObject, isEmptyObject } from '@ez4/utils';
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

export const getSourceCreationSchema = (schema: ObjectSchema, relation: PgRelationWithSchema) => {
  const relationSchema = deepClone(schema, { depth: 2 });

  delete relationSchema.properties[relation.sourceColumn];

  return relationSchema;
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

export const getSourceConnectionSchema = (schema: ObjectSchema, relation: PgRelationWithSchema): ObjectSchema => {
  const { sourceColumn } = relation;

  return {
    type: SchemaType.Object,
    properties: {
      [sourceColumn]: schema.properties[sourceColumn]
    }
  };
};

export const getTargetCreationSchema = (schema: ObjectSchema, relation: PgRelationWithSchema) => {
  const relationSchema = deepClone(schema, { depth: 2 });

  delete relationSchema.properties[relation.targetColumn];

  return relationSchema;
};

export const getTargetConnectionSchema = (schema: ObjectSchema, relation: PgRelationWithSchema): ObjectSchema => {
  const { targetColumn } = relation;

  return {
    type: SchemaType.Object,
    properties: {
      [targetColumn]: schema.properties[targetColumn]
    }
  };
};

export const isPrimaryConnection = (primaryColumn: string, record: AnyObject) => {
  const { [primaryColumn]: relationValue, ...otherFields } = record;

  return relationValue !== undefined && isEmptyObject(otherFields);
};
