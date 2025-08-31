import type { ObjectSchema } from '@ez4/schema';
import type { PgRelationWithSchema } from '../types/repository.js';

import { deepClone, isAnyObject } from '@ez4/utils';
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

export const getUpdatingSchema = (schema: ObjectSchema) => {
  const relationSchema = deepClone(schema, { depth: 2 });

  for (const propertyName in relationSchema.properties) {
    relationSchema.properties[propertyName].optional = true;
  }

  return relationSchema;
};
