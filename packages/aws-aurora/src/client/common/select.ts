import type { ObjectSchema } from '@ez4/schema';
import type { Database, Relations, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { AnyObject, isAnyNumber, isAnyObject } from '@ez4/utils';
import { isObjectSchema } from '@ez4/schema';

import { prepareWhereFields } from './where.js';
import { prepareOrderFields } from './order.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareSelectQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindOneInput<T, S, I> | Query.FindManyInput<T, S, I>
): PrepareResult => {
  const hasRelations = hasRelationFields(query.select, relations);
  const selectFields = prepareSelectFields(query.select, schema, relations);

  const statement = [`SELECT ${selectFields} FROM "${table}"${hasRelations ? ' R' : ''}`];
  const variables = [];

  if (query.where) {
    const [whereFields, whereVariables] = prepareWhereFields(schema, query.where);

    if (whereFields) {
      statement.push(`WHERE ${whereFields}`);
      variables.push(...whereVariables);
    }
  }

  if ('order' in query && isAnyObject(query.order)) {
    const orderFields = prepareOrderFields(query.order);

    if (orderFields) {
      statement.push(`ORDER BY ${orderFields}`);
    }
  }

  if ('cursor' in query && isAnyNumber(query.cursor)) {
    statement.push(`OFFSET ${query.cursor}`);
  }

  if ('limit' in query && isAnyNumber(query.limit)) {
    statement.push(`LIMIT ${query.limit}`);
  }

  return [statement.join(' '), variables];
};

export const prepareSelectFields = <T extends Database.Schema, R extends Relations>(
  fields: Partial<Query.SelectInput<T, R>>,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema
) => {
  const prepareAll = <T extends Database.Schema, R extends Relations>(
    fields: Partial<Query.SelectInput<T, R>>,
    schema: ObjectSchema,
    relations: RepositoryRelationsWithSchema,
    object: boolean,
    path?: string
  ): string => {
    const selectFields: string[] = [];

    for (const fieldKey in fields) {
      const fieldValue = fields[fieldKey];

      if (!fieldValue) {
        continue;
      }

      const fieldRelation = relations[fieldKey];

      if (fieldRelation) {
        const { sourceTable, sourceColumn, sourceSchema, targetColumn, foreign } = fieldRelation;

        const relationFields = prepareAll(fieldValue, sourceSchema, {}, true);

        const relationResult = !foreign
          ? `COALESCE(json_agg(json_build_object(${relationFields})), '[]'::json)`
          : `json_build_object(${relationFields})`;

        const relationSelect =
          `SELECT ${relationResult} FROM "${sourceTable}" ` +
          `WHERE "${sourceColumn}" = R."${targetColumn}"`;

        selectFields.push(`(${relationSelect}) AS "${fieldKey}"`);
        continue;
      }

      const fieldPath = path ? `${path}['${fieldKey}']` : `"${fieldKey}"`;

      const fieldSchema = schema.properties[fieldKey];

      if (!fieldSchema) {
        throw new Error(`Field schema for ${fieldValue} doesn't exists.`);
      }

      if (isObjectSchema(fieldSchema) && isAnyObject(fieldValue)) {
        const fieldObject = prepareAll(fieldValue, fieldSchema, relations, true, fieldPath);

        selectFields.push(`json_build_object(${fieldObject}) AS "${fieldKey}"`);
        continue;
      }

      if (path || object) {
        selectFields.push(`'${fieldKey}', ${fieldPath}`);
        continue;
      }

      selectFields.push(fieldPath);
    }

    if (selectFields.length) {
      return selectFields.join(', ');
    }

    return getSchemaFields(schema, object).join(', ');
  };

  return prepareAll(fields, schema, relations, false);
};

const getSchemaFields = (schema: ObjectSchema, object: boolean) => {
  const fields = [];

  for (const fieldKey in schema.properties) {
    fields.push(object ? `'${fieldKey}', "${fieldKey}"` : `"${fieldKey}"`);
  }

  return fields;
};

const hasRelationFields = (select: AnyObject, relations: RepositoryRelationsWithSchema) => {
  for (const alias in relations) {
    const selectState = select[alias];

    if (selectState === true || isAnyObject(selectState)) {
      return true;
    }
  }

  return false;
};
