import type { Database, Relations, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject, DeepPartial } from '@ez4/utils';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { SchemaTypeName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { prepareSelectFields } from './select.js';
import { prepareWhereFields } from './where.js';
import { prepareFieldData } from './data.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareUpdateQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<T, S, I, R> | Query.UpdateManyInput<T, S>
) => {
  const prepareAll = (
    table: string,
    schema: ObjectSchema,
    relations: RepositoryRelationsWithSchema,
    query: Query.UpdateOneInput<T, S, I, R> | Query.UpdateManyInput<T, S>,
    from: string | null,
    index: number
  ): PrepareResult => {
    const relationStatements = [];
    const relationVariables = [];
    const relationFields = [];

    let relationId = 1;

    for (const alias in relations) {
      const relationData = (query.data as AnyObject)[alias];

      if (!relations[alias] || !isAnyObject(relationData) || Array.isArray(relationData)) {
        continue;
      }

      const previous = `R${relationId++}`;

      const { sourceTable, sourceColumn, sourceSchema, targetColumn } = relations[alias];

      const [statement, variables] = prepareAll(
        sourceTable,
        sourceSchema,
        {},
        {
          data: relationData as any
        },
        previous,
        index + relationVariables.length
      );

      relationStatements.push(
        `${statement} WHERE "${sourceColumn}" = ${previous}."${targetColumn}" RETURNING ${previous}.*`
      );

      relationFields.push(`"${targetColumn}"`);

      relationVariables.push(...variables);
    }

    const [updateFields, updateVariables] = prepareUpdateFields(
      query.data,
      schema,
      relations,
      index + relationVariables.length
    );

    const statement = [`UPDATE "${table}" SET ${updateFields}`];

    if (from) {
      statement.push(`FROM ${from}`);
    }

    if (query.where) {
      const [whereFields, whereVariables] = prepareWhereFields(schema, query.where);

      if (whereFields) {
        statement.push(`WHERE ${whereFields}`);
        updateVariables.push(...whereVariables);
      }
    }

    if (query.select) {
      const selectFields = prepareSelectFields(query.select, schema, relations);

      statement.push(`RETURNING ${[selectFields, ...relationFields].join(', ')}`);
    } else if (relationFields.length) {
      statement.push(`RETURNING ${relationFields.join(', ')}`);
    }

    if (relationStatements.length) {
      const variables = [...relationVariables, ...updateVariables];

      const updateStatement = relationStatements.pop();

      const withStatements = [statement.join(' '), ...relationStatements]
        .map((statement, index) => `R${index + 1} AS (${statement})`)
        .join(', ');

      const statements = `WITH ${withStatements} ${updateStatement}`;

      return [statements, variables];
    }

    return [statement.join(' '), updateVariables];
  };

  return prepareAll(table, schema, relations, query, null, 0);
};

const prepareUpdateFields = <T extends Database.Schema>(
  data: DeepPartial<T>,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  index: number
): PrepareResult => {
  const variables: SqlParameter[] = [];
  const operations: string[] = [];

  const prepareAll = (schema: ObjectSchema, data: DeepPartial<T>, path?: string) => {
    for (const fieldKey in data) {
      const fieldValue = data[fieldKey];
      const fieldRelation = relations[fieldKey];

      if (fieldValue === undefined || fieldRelation) {
        continue;
      }

      const fieldSchema = schema.properties[fieldKey];

      if (!fieldSchema) {
        throw new Error(`Field schema for ${fieldKey} doesn't exists.`);
      }

      const fieldPath = path ? `${path}['${fieldKey}']` : `"${fieldKey}"`;

      const fieldNotNested =
        !isAnyObject(fieldValue) ||
        fieldSchema.type !== SchemaTypeName.Object ||
        fieldSchema.nullable ||
        fieldSchema.optional;

      if (fieldNotNested) {
        const fieldName = `${index++}i`;
        const fieldData = prepareFieldData(fieldName, fieldValue, fieldSchema);

        operations.push(`${fieldPath} = :${fieldName}`);
        variables.push(fieldData);

        continue;
      }

      prepareAll(fieldSchema, fieldValue, fieldPath);
    }
  };

  prepareAll(schema, data);

  return [operations.join(', '), variables];
};
