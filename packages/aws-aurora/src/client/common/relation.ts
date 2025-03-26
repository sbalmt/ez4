import type { RelationWithSchema } from '../../types/repository.js';

import { IsNullishSchema, ObjectSchema } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { isSkippableData } from './data.js';

export const isSingleRelationData = (value: unknown) => {
  return isAnyObject(value);
};

export const isMultipleRelationData = (value: unknown) => {
  return Array.isArray(value);
};

export const isRelationalData = (value: unknown): boolean => {
  return isSingleRelationData(value) || isMultipleRelationData(value);
};

export const canSkipRelationField = (tableSchema: ObjectSchema, fieldValue: unknown, fieldRelation: RelationWithSchema) => {
  const { sourceColumn, targetColumn, targetIndex } = fieldRelation;

  const isForeignRelationKey = targetIndex !== Index.Primary;

  const relationColumn = isForeignRelationKey ? targetColumn : sourceColumn;
  const relationSchema = tableSchema.properties[relationColumn];

  return isSkippableData(fieldValue) && IsNullishSchema(relationSchema);
};
