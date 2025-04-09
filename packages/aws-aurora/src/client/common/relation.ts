import { deepClone, isAnyObject } from '@ez4/utils';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { RelationWithSchema } from '../../main.js';

export const isSingleRelationData = (value: unknown) => {
  return isAnyObject(value);
};

export const isMultipleRelationData = (value: unknown) => {
  return Array.isArray(value);
};

export const isRelationalData = (value: unknown): boolean => {
  return isSingleRelationData(value) || isMultipleRelationData(value);
};

export const getSourceCreationSchema = (schema: ObjectSchema, relation: RelationWithSchema) => {
  const relationSchema = deepClone(schema, { depth: 2 });

  delete relationSchema.properties[relation.sourceColumn];

  return relationSchema;
};

export const getSourceConnectionSchema = (schema: ObjectSchema, relation: RelationWithSchema): ObjectSchema => {
  const { sourceColumn } = relation;

  return {
    type: SchemaType.Object,
    properties: {
      [sourceColumn]: schema.properties[sourceColumn]
    }
  };
};

export const getTargetCreationSchema = (schema: ObjectSchema, relation: RelationWithSchema) => {
  const relationSchema = deepClone(schema, { depth: 2 });

  delete relationSchema.properties[relation.targetColumn];

  return relationSchema;
};

export const getTargetConnectionSchema = (schema: ObjectSchema, relation: RelationWithSchema): ObjectSchema => {
  const { targetColumn } = relation;

  return {
    type: SchemaType.Object,
    properties: {
      [targetColumn]: schema.properties[targetColumn]
    }
  };
};
